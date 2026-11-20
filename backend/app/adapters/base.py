from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List

class BasePortalAdapter(ABC):
    """
    Standard Base Interface for All Indian Examination Portal Adapters.
    Complies strictly with official portal integration rules:
    - Never bypasses CAPTCHAs, OTPs, or anti-bot protections.
    - Honors student-controlled authentication.
    - Provides verified official redirection when direct API is restricted.
    """
    adapter_name: str = "BasePortalAdapter"
    organization_code: str = "BASE"
    supported_methods: List[str] = ["OFFICIAL_REDIRECT"]

    @abstractmethod
    def get_organization_info(self) -> Dict[str, Any]:
        """Returns verified organization metadata and URLs."""
        pass

    @abstractmethod
    def get_exam_details(self, exam_code: str) -> Dict[str, Any]:
        """Returns official examination details, requirements, and cycles."""
        pass

    @abstractmethod
    def check_result_availability(self, exam_code: str, year: int) -> Dict[str, Any]:
        """Checks if results are announced and available for retrieval."""
        pass

    @abstractmethod
    def retrieve_result(
        self,
        exam_code: str,
        roll_number: str,
        registration_number: Optional[str] = None,
        date_of_birth: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Retrieves authentic score and status from verified integration.
        Returns result payload or official verification redirect instructions.
        """
        pass

    @abstractmethod
    def check_hall_ticket_availability(self, exam_code: str, year: int) -> Dict[str, Any]:
        """Checks admit card release status."""
        pass

    @abstractmethod
    def retrieve_hall_ticket(
        self,
        exam_code: str,
        application_number: str,
        date_of_birth: Optional[str] = None
    ) -> Dict[str, Any]:
        """Retrieves official admit card or verified download instructions."""
        pass

    @abstractmethod
    def check_id_card_availability(self, enrollment_number: str) -> Dict[str, Any]:
        """Checks institutional student ID card retrieval support."""
        pass

    @abstractmethod
    def retrieve_id_card(
        self,
        enrollment_number: str,
        admission_year: int,
        date_of_birth: Optional[str] = None
    ) -> Dict[str, Any]:
        """Retrieves verified student ID card metadata or upload gateway."""
        pass

    @abstractmethod
    def validate_document(self, file_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        """Performs security, malware signature, and MIME validation on document."""
        pass

    @abstractmethod
    def get_integration_status(self) -> Dict[str, Any]:
        """Returns health, response latency, and operational status of integration."""
        pass
