"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  GraduationCap, BookOpen, Video, FileText, HelpCircle,
  CheckCircle2, XCircle, Award, Bookmark, Download, ExternalLink,
  ChevronRight, ArrowLeft, Play, Sparkles, Share2, Clock, Check
} from "lucide-react";
import { SchoolChapterResource, initialSchoolChapters } from "@/lib/platformData";

export default function SchoolChapterLearningPage() {
  const params = useParams();
  const chapterId = params?.id as string;

  const [chapter, setChapter] = useState<SchoolChapterResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"NOTES" | "VIDEOS" | "PAPERS" | "IMPORTANT" | "QUIZ">("NOTES");

  // Video state
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [completedVideoIds, setCompletedVideoIds] = useState<string[]>([]);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Saved chapter state
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    // Look up chapter from initial data or API
    const found = initialSchoolChapters.find(c => c.id === chapterId) || initialSchoolChapters[0];
    setChapter(found);
    if (found?.video_lessons?.[0]?.youtube_id) {
      setActiveVideoId(found.video_lessons[0].youtube_id);
    }
    setLoading(false);

    // Load saved states from localStorage
    const saved = localStorage.getItem(`examhub_saved_chapter_${chapterId}`);
    if (saved === "true") setIsSaved(true);

    const savedCompletedVideos = localStorage.getItem(`examhub_completed_videos_${chapterId}`);
    if (savedCompletedVideos) {
      try {
        setCompletedVideoIds(JSON.parse(savedCompletedVideos));
      } catch (_) {}
    }
  }, [chapterId]);

  function toggleSaveChapter() {
    const next = !isSaved;
    setIsSaved(next);
    localStorage.setItem(`examhub_saved_chapter_${chapterId}`, String(next));
  }

  function handleVideoSelect(ytId: string) {
    setActiveVideoId(ytId);
  }

  function markVideoCompleted(id: string) {
    let updated: string[];
    if (completedVideoIds.includes(id)) {
      updated = completedVideoIds.filter(v => v !== id);
    } else {
      updated = [...completedVideoIds, id];
    }
    setCompletedVideoIds(updated);
    localStorage.setItem(`examhub_completed_videos_${chapterId}`, JSON.stringify(updated));
  }

  function handleSelectQuizOption(questionId: number, optionIdx: number) {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  }

  function handleQuizSubmit() {
    if (!chapter) return;
    let score = 0;
    chapter.practice_quiz.forEach(q => {
      if (quizAnswers[q.id] === q.correct_option) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  }

  function handleQuizReset() {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  }

  if (loading || !chapter) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <GraduationCap className="w-10 h-10 text-blue-600 animate-bounce mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading chapter learning resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* 1. TOP BREADCRUMB & HEADER */}
      <section className="bg-gradient-to-b from-[#081629] via-[#0f2746] to-[#081629] text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-medium">
            <Link href="/school" className="hover:text-blue-300">School Portal</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/school/boards" className="hover:text-blue-300">{chapter.board_code}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Class {chapter.class_level}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{chapter.subject}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold">Chapter {chapter.chapter_number}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-2">
                <span>{chapter.board_name} • Class {chapter.class_level} {chapter.subject}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Chapter {chapter.chapter_number}: {chapter.chapter_title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSaveChapter}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  isSaved
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                <span>{isSaved ? "Saved" : "Save Chapter"}</span>
              </button>

              {chapter.pdf_notes_url && (
                <a
                  href={chapter.pdf_notes_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>NCERT PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FIVE-TAB NAVIGATION BAR */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-2 border border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto text-xs font-bold">
          {[
            { id: "NOTES", label: "1. Chapter Notes", icon: BookOpen },
            { id: "VIDEOS", label: "2. Video Lessons", icon: Video },
            { id: "PAPERS", label: "3. Previous Exam Papers", icon: FileText },
            { id: "IMPORTANT", label: "4. Important Questions", icon: Sparkles },
            { id: "QUIZ", label: "5. Practice Quiz", icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. TAB CONTENT CONTAINERS */}
        <div className="mt-6">
          {/* TAB 1: CHAPTER NOTES */}
          {activeTab === "NOTES" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Summary Notes & Core Formulas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Comprehensive study notes covering definitions, laws, derivations, and board exam tips.
                  </p>
                </div>

                {chapter.pdf_notes_url && (
                  <a
                    href={chapter.pdf_notes_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full NCERT Textbook PDF</span>
                  </a>
                )}
              </div>

              {/* Rendered Notes Body */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {chapter.summary_notes}
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO LESSONS */}
          {activeTab === "VIDEOS" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Embedded Video Player */}
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-xl border border-slate-800 relative">
                  {activeVideoId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=0&rel=0`}
                      title="Educational Lesson Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    ></iframe>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                      <Play className="w-12 h-12 text-slate-600" />
                      <p className="text-xs">Select a video lesson from the playlist</p>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Currently Watching
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {chapter.video_lessons.find(v => v.youtube_id === activeVideoId)?.duration || "Full Lesson"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {chapter.video_lessons.find(v => v.youtube_id === activeVideoId)?.title || "Select a Lesson"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Channel: {chapter.video_lessons.find(v => v.youtube_id === activeVideoId)?.channel_name || "ExamHub Learning"}
                  </p>
                </div>
              </div>

              {/* Playlist Sidebar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 h-fit">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-500" />
                    <span>Chapter Playlist ({chapter.video_lessons.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {completedVideoIds.length}/{chapter.video_lessons.length} Completed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {chapter.video_lessons.map((vid, idx) => {
                    const isActive = activeVideoId === vid.youtube_id;
                    const isDone = completedVideoIds.includes(vid.id);
                    return (
                      <div
                        key={vid.id}
                        onClick={() => handleVideoSelect(vid.youtube_id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-mono">Lesson {idx + 1}</span>
                          <span className="text-slate-400">{vid.duration}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {vid.title}
                        </h4>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-500 line-clamp-1">{vid.topic}</span>
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              markVideoCompleted(vid.id);
                            }}
                            className={`p-1 rounded-md text-[10px] flex items-center gap-1 ${
                              isDone ? "text-emerald-500 font-bold" : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>{isDone ? "Completed" : "Mark Done"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PREVIOUS QUESTION PAPERS */}
          {activeTab === "PAPERS" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Past Board Examination Questions & Answers
                </h2>
                <p className="text-xs text-slate-500">
                  Questions asked in previous board exams from this specific chapter with official model solutions.
                </p>
              </div>

              <div className="space-y-4">
                {chapter.previous_exam_questions.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-xs">
                        {chapter.board_code} {item.year} Examination
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {item.marks} Marks
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Q: {item.question}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Model Answer:</span>
                      <p className="leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: IMPORTANT QUESTIONS */}
          {activeTab === "IMPORTANT" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Frequently Asked & Expected Questions
                </h2>
                <p className="text-xs text-slate-500">
                  Categorized 2-Mark, 3-Mark, and 5-Mark long answer derivations essential for scoring full marks.
                </p>
              </div>

              <div className="space-y-4">
                {chapter.important_questions.map(q => (
                  <div key={q.id} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs">
                        {q.marks}-Mark Question
                      </span>
                    </div>

                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {q.question}
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-slate-500 font-bold block">Key Points to Mention:</span>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
                        {q.key_points.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PRACTICE TESTS (QUIZ) */}
          {activeTab === "QUIZ" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Interactive Multiple Choice Practice Quiz
                  </h2>
                  <p className="text-xs text-slate-500">
                    Test your understanding with instant score evaluation and explanations.
                  </p>
                </div>

                {quizSubmitted && (
                  <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    Score: {quizScore} / {chapter.practice_quiz.length} ({Math.round((quizScore / chapter.practice_quiz.length) * 100)}%)
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {chapter.practice_quiz.map((q, qIdx) => {
                  const selectedOpt = quizAnswers[q.id];
                  return (
                    <div key={q.id} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Question {qIdx + 1}: {q.question}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";

                          if (quizSubmitted) {
                            if (optIdx === q.correct_option) {
                              btnStyle = "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
                            } else if (isSelected && optIdx !== q.correct_option) {
                              btnStyle = "bg-red-50 dark:bg-red-950/60 border-red-500 text-red-800 dark:text-red-200";
                            }
                          } else if (isSelected) {
                            btnStyle = "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 font-bold";
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleSelectQuizOption(q.id, optIdx)}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === q.correct_option && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              )}
                              {quizSubmitted && isSelected && optIdx !== q.correct_option && (
                                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 text-[11px] text-blue-900 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/50">
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length === 0}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all ml-auto"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleQuizReset}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all ml-auto"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
