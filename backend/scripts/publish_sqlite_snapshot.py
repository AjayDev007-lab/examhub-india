"""Publish a local SQLite database as the initial Firestore persistence snapshot.

By default, this validates and reports the input without contacting Firestore.
Pass --apply to publish. Existing snapshots are protected unless
--replace-existing is also explicitly supplied.
"""

from __future__ import annotations

import argparse
import os
import sqlite3
import subprocess
import tempfile
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_ROOT.parent
REST_PUBLISHER = BACKEND_ROOT / "scripts" / "publish_firestore_snapshot.mjs"


def inspect_database(path: Path) -> tuple[int, int]:
    if not path.is_file():
        raise FileNotFoundError(f"SQLite database not found: {path}")
    with sqlite3.connect(f"file:{path.as_posix()}?mode=ro", uri=True) as connection:
        check = connection.execute("PRAGMA quick_check").fetchone()
        if not check or check[0] != "ok":
            raise RuntimeError("SQLite quick_check failed; refusing to publish this database")
        tables = [
            row[0]
            for row in connection.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            )
        ]
        rows = sum(
            connection.execute(f'SELECT COUNT(*) FROM "{table.replace(chr(34), chr(34) * 2)}"').fetchone()[0]
            for table in tables
        )
        return len(tables), rows


def omit_file_references(source: Path, target: Path) -> int:
    """Copy the authoritative DB and clear obsolete local file paths in the copy."""
    input_db = sqlite3.connect(str(source))
    output_db = sqlite3.connect(str(target))
    try:
        input_db.backup(output_db)
        cleared = 0
        for table, columns in (
            ("student_documents", ("stored_path", "preview_path")),
            ("exam_results", ("scorecard_path",)),
        ):
            present = {
                row[1]
                for row in output_db.execute(f'PRAGMA table_info("{table}")').fetchall()
            }
            for column in columns:
                if column not in present:
                    continue
                replacement = "" if table == "student_documents" and column == "stored_path" else None
                cursor = output_db.execute(
                    f'UPDATE "{table}" SET "{column}" = ? WHERE "{column}" IS NOT NULL AND "{column}" != ""',
                    (replacement,),
                )
                cleared += cursor.rowcount
        output_db.commit()
        return cleared
    finally:
        output_db.close()
        input_db.close()


def publish(path: Path, project_id: str, service_account: Path, replace_existing: bool) -> None:
    command = [
        "node",
        str(REST_PUBLISHER),
        "--database",
        str(path.resolve()),
        "--project-id",
        project_id,
        "--service-account",
        str(service_account.resolve()),
    ]
    if replace_existing:
        command.append("--replace-existing")
    subprocess.run(command, cwd=REPO_ROOT, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--database",
        type=Path,
        default=REPO_ROOT / "examhub_india.db",
        help="SQLite source database (default: repository examhub_india.db)",
    )
    parser.add_argument("--project-id", default=os.getenv("FIREBASE_PROJECT_ID", ""))
    parser.add_argument(
        "--service-account",
        type=Path,
        default=os.getenv("FIREBASE_SERVICE_ACCOUNT_FILE", ""),
        help="Path to the private Firebase service-account JSON file",
    )
    parser.add_argument("--apply", action="store_true", help="Publish the snapshot to Firestore")
    parser.add_argument(
        "--replace-existing",
        action="store_true",
        help="Allow replacing the current Firestore snapshot; requires --apply",
    )
    parser.add_argument(
        "--omit-file-references",
        action="store_true",
        help="Clear local document, preview, and scorecard paths in a temporary database copy before publishing",
    )
    args = parser.parse_args()

    if args.replace_existing and not args.apply:
        parser.error("--replace-existing requires --apply")
    if not args.project_id and args.apply:
        parser.error("--apply requires --project-id or FIREBASE_PROJECT_ID")
    if args.apply and not args.service_account:
        parser.error("--apply requires --service-account or FIREBASE_SERVICE_ACCOUNT_FILE")

    database = args.database.resolve()
    table_count, row_count = inspect_database(database)
    print(f"Source: {database}")
    print(f"Size: {database.stat().st_size} bytes; tables: {table_count}; rows: {row_count}")

    if not args.apply:
        print("Dry run only; no Firestore connection or writes were made. Review the source before using --apply.")
        return 0

    if args.omit_file_references:
        with tempfile.TemporaryDirectory(prefix="examhub-firestore-import-") as temporary_dir:
            prepared_database = Path(temporary_dir) / database.name
            cleared = omit_file_references(database, prepared_database)
            print(f"Cleared {cleared} local file reference(s) in a temporary copy; the source SQLite file was not changed.")
            publish(prepared_database, args.project_id, args.service_account, args.replace_existing)
    else:
        publish(database, args.project_id, args.service_account, args.replace_existing)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
