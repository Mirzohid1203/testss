"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Question, Subject } from "@/types";
import { Plus, Trash2, Edit3, Loader2, Filter, X, ChevronRight, CheckCircle2, FileUp } from "lucide-react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

export default function AdminTests() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [selectedGrade, setSelectedGrade] = useState<string>("9"); // Default to 9th grade
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        subjectId: "",
        gradeLevel: "9"
    });
    const [isEditing, setIsEditing] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "subjects"), orderBy("title"));
        return onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
            setSubjects(data);
            if (data.length > 0 && !selectedSubjectId) {
                setSelectedSubjectId(data[0].id);
            }
        });
    }, []);

    useEffect(() => {
        if (!selectedSubjectId) return;
        setLoading(true);
        // Filter by BOTH subject and grade level
        const q = query(
            collection(db, "tests"), 
            where("subjectId", "==", selectedSubjectId),
            where("gradeLevel", "==", selectedGrade)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
            setQuestions(data);
            setLoading(false);
        }, (err) => {
            toast.error(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [selectedSubjectId, selectedGrade]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentQuestion.subjectId && !selectedSubjectId) {
            toast.error("Please select a subject");
            return;
        }

        setBtnLoading(true);
        const dataToSave = {
            ...currentQuestion,
            subjectId: currentQuestion.subjectId || selectedSubjectId,
            gradeLevel: currentQuestion.gradeLevel || selectedGrade,
            createdAt: Date.now()
        };

        try {
            if (isEditing && currentQuestion.id) {
                const { id, ...rest } = dataToSave;
                await updateDoc(doc(db, "tests", id as string), rest);
                toast.success("Question updated");
            } else {
                await addDoc(collection(db, "tests"), dataToSave);
                toast.success("Question added");
            }
            setIsModalOpen(false);
            resetForm();
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setBtnLoading(false);
        }
    };

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedSubjectId) {
            toast.error("Iltimos, avval fanni tanlang!");
            return;
        }

        setImportLoading(true);
        const reader = new FileReader();

        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

                // Skip header row (index 0)
                const questionsToImport = data.slice(1).filter(row => row[1] && row[6]).map(row => {
                    const question = row[1]?.toString() || "";
                    const options = [
                        row[2]?.toString() || "",
                        row[3]?.toString() || "",
                        row[4]?.toString() || "",
                        row[5]?.toString() || ""
                    ];
                    
                    const correctChar = row[6]?.toString().trim().toUpperCase();
                    const correctAnswer = correctChar === "A" ? 0 : 
                                        correctChar === "B" ? 1 : 
                                        correctChar === "C" ? 2 : 
                                        correctChar === "D" ? 3 : 0;

                    return {
                        question,
                        options,
                        correctAnswer,
                        subjectId: selectedSubjectId,
                        gradeLevel: selectedGrade,
                        createdAt: Date.now()
                    };
                });

                if (questionsToImport.length === 0) {
                    toast.error("Excel faylda ma'lumot topilmadi yoki format noto'g'ri.");
                    setImportLoading(false);
                    return;
                }

                // Batch add
                const promises = questionsToImport.map(q => addDoc(collection(db, "tests"), q));
                await Promise.all(promises);

                toast.success(`${questionsToImport.length} ta savol muvaffaqiyatli yuklandi!`);
                e.target.value = ""; // Reset input
            } catch (err: any) {
                toast.error("Xatolik: " + err.message);
            } finally {
                setImportLoading(false);
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this question?")) return;
        try {
            await deleteDoc(doc(db, "tests", id as string));
            toast.success("Question deleted");
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const resetForm = () => {
        setCurrentQuestion({
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
            subjectId: selectedSubjectId,
            gradeLevel: selectedGrade
        });
        setIsEditing(false);
    };

    const openEdit = (q: Question) => {
        setCurrentQuestion(q);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const updateOption = (idx: number, val: string) => {
        const newOptions = [...(currentQuestion.options || ["", "", "", ""])];
        newOptions[idx] = val;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Questions</h1>
                    <p className="text-gray-400">Manage test pool and answers</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-gray-900/50 border border-gray-800 p-1">
                        <select
                            className="rounded-lg bg-transparent px-3 py-1.5 text-sm text-white outline-none focus:text-blue-400"
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                        >
                            {[5, 6, 7, 8, 9, 10, 11].map(g => (
                                <option key={g} value={g.toString()}>{g}-sinf</option>
                            ))}
                        </select>
                        <div className="h-4 w-px bg-gray-800" />
                        <select
                            className="rounded-lg bg-transparent px-3 py-1.5 text-sm text-white outline-none focus:text-blue-400"
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                        >
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.title}</option>
                            ))}
                        </select>
                    </div>
                    <label className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 whitespace-nowrap shadow-lg shadow-emerald-900/20 transition-all active:scale-95 cursor-pointer">
                        {importLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileUp className="h-4 w-4" />
                        )}
                        Exceldan yuklash
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleExcelUpload}
                            disabled={importLoading}
                        />
                    </label>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 whitespace-nowrap shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Savol Qo'shish
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                    </div>
                ) : questions.length > 0 ? (
                    questions.map((q, i) => (
                        <div key={q.id} className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 transition-all hover:bg-gray-900/80">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <span className="mb-2 inline-block rounded bg-gray-800 px-2 py-1 text-[10px] font-bold uppercase text-gray-500">
                                        Question {i + 1}
                                    </span>
                                    <h3 className="text-lg font-medium text-white">{q.question}</h3>
                                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {q.options.map((opt, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${idx === q.correctAnswer
                                                    ? "border-green-500/50 bg-green-500/10 text-green-400"
                                                    : "border-gray-800 bg-gray-900/50 text-gray-400"
                                                    }`}
                                            >
                                                {idx === q.correctAnswer && <CheckCircle2 className="h-4 w-4" />}
                                                <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => openEdit(q)}
                                        className="rounded-lg bg-gray-800 p-2 text-blue-400 hover:bg-blue-400/10 transition-colors"
                                    >
                                        <Edit3 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(q.id)}
                                        className="rounded-lg bg-gray-800 p-2 text-red-400 hover:bg-red-400/10 transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-900/30 py-20 text-center text-gray-500">
                        No questions found for this subject.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                {isEditing ? "Edit Question" : "New Question"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                    <select
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white outline-none focus:border-blue-500"
                                        value={currentQuestion.subjectId || selectedSubjectId}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, subjectId: e.target.value })}
                                    >
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Target Grade</label>
                                    <select
                                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white outline-none focus:border-blue-500"
                                        value={currentQuestion.gradeLevel || selectedGrade}
                                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, gradeLevel: e.target.value })}
                                    >
                                        {[5, 6, 7, 8, 9, 10, 11].map(g => (
                                            <option key={g} value={g.toString()}>{g}-sinf</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Question Text</label>
                                <textarea
                                    required
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                                    rows={2}
                                    value={currentQuestion.question}
                                    onChange={e => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                    placeholder="e.g. What is the capital of France?"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {currentQuestion.options?.map((opt, idx) => (
                                    <div key={idx}>
                                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">
                                            Option {String.fromCharCode(65 + idx)}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={currentQuestion.correctAnswer === idx}
                                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                                                className="h-5 w-5 border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                                            />
                                            <input
                                                type="text"
                                                required
                                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                                value={opt}
                                                onChange={e => updateOption(idx, e.target.value)}
                                                placeholder={`Option ${idx + 1}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="submit"
                                disabled={btnLoading}
                                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {btnLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : "Save Question"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
