import AdminLayout from '@/Layouts/AdminLayout';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { PageProps } from '@/types';
import { 
    BookOpen, 
    ChevronLeft, 
    ChevronRight, 
    Clock3, 
    Eye, 
    FileText, 
    Loader2, 
    Library, 
    Plus, 
    Search, 
    Send,
    MessageSquare,
    StickyNote,
    X, 
    Users, 
    Bookmark,
    BookMarked,
    ArrowLeft,
    Calendar,
    Pencil,
    Trash2,
    Upload,
    Layers
} from 'lucide-react';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Modern color palette
const bookColors = [
    { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    { bg: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
    { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
];

function getBookColor(bookId: number) {
    return bookColors[bookId % bookColors.length];
}

function getCategoryBadgeColor(category: string | null): string {
    if (!category) return 'bg-slate-100 text-slate-600';
    const colors: Record<string, string> = {
        'Fiksi': 'bg-indigo-100 text-indigo-700',
        'Novel': 'bg-rose-100 text-rose-700',
        'Sejarah': 'bg-amber-100 text-amber-700',
        'Sains': 'bg-emerald-100 text-emerald-700',
        'Teknologi': 'bg-cyan-100 text-cyan-700',
        'Biografi': 'bg-orange-100 text-orange-700',
        'Pendidikan': 'bg-violet-100 text-violet-700',
        'Agama': 'bg-teal-100 text-teal-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-600';
}

type Book = {
    id: number;
    title: string;
    author: string;
    category: string | null;
    description: string | null;
    total_pages: number;
    is_active: boolean;
};

type Borrower = {
    id: number;
    name: string;
    role: string;
};

type Loan = {
    id: number;
    user_id: number;
    library_book_id: number;
    due_at: string;
    status: string;
    user: {
        id: number;
        name: string;
    };
    book: {
        id: number;
        title: string;
        total_pages: number;
    };
};

type ReadingProgress = {
    library_book_id: number;
    current_page: number;
    last_seen_at: string | null;
};

type PresenceParticipant = {
    user_id: number;
    name: string;
    current_page: number;
    last_seen_at: string | null;
};

type LibraryBookmark = {
    id: number;
    page_number: number;
    note: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type LibraryComment = {
    id: number;
    user_id: number;
    current_page: number | null;
    comment: string;
    created_at: string | null;
    user: {
        id: number | null;
        name: string | null;
    };
};

type LibraryPageProps = PageProps<{
    role: 'admin' | 'teacher' | 'student';
    books: Book[];
    loans: Loan[];
    borrowers: Borrower[];
    myActiveLoans: Loan[];
    readingProgress: Record<number, ReadingProgress>;
    auth: {
        user: {
            id: number;
            name: string;
        } | null;
    };
}>;

type Props = {
    books: Book[];
    loans: Loan[];
    borrowers: Borrower[];
    myActiveLoans: Loan[];
    readingProgress: Record<number, ReadingProgress>;
};

export default function PerpustakaanIndex({
    books,
    loans,
    borrowers,
    myActiveLoans,
    readingProgress,
}: Props) {
    const { flash, auth, role } = usePage<LibraryPageProps>().props;
    const [view, setView] = useState<'library' | 'reader' | 'add-book'>('library');
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sessionId, setSessionId] = useState<string>(() => `sess-${Date.now()}`);
    const [presenceParticipants, setPresenceParticipants] = useState<PresenceParticipant[]>([]);
    const [bookmarks, setBookmarks] = useState<LibraryBookmark[]>([]);
    const [comments, setComments] = useState<LibraryComment[]>([]);
    const [bookmarkNote, setBookmarkNote] = useState<string>('');
    const [commentMessage, setCommentMessage] = useState<string>('');
    const [bookmarkProcessing, setBookmarkProcessing] = useState<boolean>(false);
    const [commentProcessing, setCommentProcessing] = useState<boolean>(false);
    const [sideNavigationEnabled, setSideNavigationEnabled] = useState<boolean>(true);
    const [pdfPageCount, setPdfPageCount] = useState<number>(1);
    const [pdfScale, setPdfScale] = useState<number>(1.2);
    const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'borrowed'>('all');
    const [sortBy, setSortBy] = useState<'latest' | 'title'>('latest');
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const readerWrapperRef = useRef<HTMLDivElement | null>(null);
    const libraryRoutePrefix = role === 'teacher' ? 'guru' : role === 'student' ? 'siswa' : 'admin';
    const canManageBooks = role === 'admin';

    const bookForm = useForm<{
        title: string;
        author: string;
        category: string;
        description: string;
        total_pages: number;
        pdf_file: File | null;
        is_active: boolean;
    }>({
        title: '',
        author: '',
        category: '',
        description: '',
        total_pages: 1,
        pdf_file: null as File | null,
        is_active: true,
    });

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { 'Semua Buku': books.length };
        books.forEach((book) => {
            const category = book.category || 'Lainnya';
            counts[category] = (counts[category] || 0) + 1;
        });
        return counts;
    }, [books]);

    const categories = useMemo(
        () => Object.keys(categoryCounts).filter((category) => category !== 'Semua Buku'),
        [categoryCounts],
    );

    const filteredFlatBooks = useMemo(() => {
        let result = [...books];

        if (selectedCategory && selectedCategory !== 'Semua Buku') {
            result = result.filter((book) => (book.category || 'Lainnya') === selectedCategory);
        }

        if (searchQuery) {
            const keyword = searchQuery.toLowerCase();
            result = result.filter(
                (book) =>
                    book.title.toLowerCase().includes(keyword) ||
                    book.author.toLowerCase().includes(keyword),
            );
        }

        if (statusFilter === 'available') {
            result = result.filter((book) => !myActiveLoans.some((loan) => loan.book.id === book.id));
        }

        if (statusFilter === 'borrowed') {
            result = result.filter((book) => myActiveLoans.some((loan) => loan.book.id === book.id));
        }

        if (sortBy === 'title') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            result.sort((a, b) => b.id - a.id);
        }

        return result;
    }, [books, myActiveLoans, searchQuery, selectedCategory, sortBy, statusFilter]);

    // Get loan for a book
    const getLoanForBook = useCallback((bookId: number) => {
        return myActiveLoans.find(loan => loan.book.id === bookId) || null;
    }, [myActiveLoans]);

    // Start reading a book
    const startReading = useCallback((book: Book, loan: Loan) => {
        setSelectedBook(book);
        setSelectedLoan(loan);
        const progress = readingProgress[book.id];
        setCurrentPage(progress?.current_page ?? 1);
        setSessionId(`sess-${Date.now()}`);
        setBookmarks([]);
        setComments([]);
        setBookmarkNote('');
        setCommentMessage('');
        setView('reader');
    }, [readingProgress]);

    // Borrow a book
    const borrowBook = useCallback((book: Book) => {
        if (!auth.user) {
            toast.error('Anda harus login untuk meminjam buku');
            return;
        }

        router.post(route(`${libraryRoutePrefix}.perpustakaan.loans.store`), {
            library_book_id: book.id,
            user_id: auth.user.id,
            duration_days: 7,
        }, {
            onSuccess: () => {
                toast.success(`Berhasil meminjam "${book.title}"`);
            },
            onError: () => {
                toast.error('Gagal meminjam buku');
            },
        });
    }, [auth.user, libraryRoutePrefix]);

    const openAddBookForm = useCallback((): void => {
        if (!canManageBooks) {
            return;
        }

        setEditingBook(null);
        bookForm.reset();
        bookForm.clearErrors();
        setView('add-book');
    }, [bookForm, canManageBooks]);

    const openEditBookForm = useCallback((book: Book): void => {
        if (!canManageBooks) {
            return;
        }

        setEditingBook(book);
        bookForm.setData({
            title: book.title,
            author: book.author,
            category: book.category ?? '',
            description: book.description ?? '',
            total_pages: book.total_pages,
            pdf_file: null,
            is_active: book.is_active,
        });
        bookForm.clearErrors();
        setView('add-book');
    }, [bookForm, canManageBooks]);

    const deleteBook = useCallback((book: Book): void => {
        if (!canManageBooks) {
            return;
        }

        const confirmDelete = window.confirm(`Hapus buku "${book.title}"?`);
        if (!confirmDelete) {
            return;
        }

        router.delete(route('admin.perpustakaan.books.destroy', book.id));
    }, [canManageBooks]);

    // Submit add/edit book
    const submitBook = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!canManageBooks) {
            toast.error('Anda tidak memiliki izin menambah buku.');
            setView('library');
            return;
        }

        if (editingBook) {
            bookForm.patch(route('admin.perpustakaan.books.update', editingBook.id), {
                forceFormData: true,
                onSuccess: () => {
                    bookForm.reset();
                    setEditingBook(null);
                    setView('library');
                    toast.success('Buku berhasil diperbarui');
                },
            });

            return;
        }

        bookForm.post(route('admin.perpustakaan.books.store'), {
            forceFormData: true,
            onSuccess: () => {
                bookForm.reset();
                setEditingBook(null);
                setView('library');
                toast.success('Buku berhasil ditambahkan');
            },
        });
    };

    // PDF Reading functions
    const syncReader = useCallback(async (eventType: 'join' | 'page-change' | 'heartbeat' | 'leave'): Promise<void> => {
        if (!selectedLoan) return;
        try {
            await axios.post(route(`${libraryRoutePrefix}.perpustakaan.reader.sync`, selectedLoan.book.id), {
                current_page: currentPage,
                session_id: sessionId,
                event: eventType,
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                toast.error('Pinjaman aktif tidak ditemukan. Silakan pinjam ulang.');
            }
        }
    }, [currentPage, libraryRoutePrefix, selectedLoan, sessionId]);

    const loadPresence = useCallback(async (pageNumber: number): Promise<void> => {
        if (!selectedLoan) {
            setPresenceParticipants([]);
            return;
        }
        try {
            const response = await axios.get(route(`${libraryRoutePrefix}.perpustakaan.reader.presence`, {
                book: selectedLoan.book.id,
                page: pageNumber,
            }));
            setPresenceParticipants(response.data.participants ?? []);
        } catch {
            setPresenceParticipants([]);
        }
    }, [libraryRoutePrefix, selectedLoan]);

    const loadBookmarks = useCallback(async (): Promise<void> => {
        if (!selectedLoan) {
            setBookmarks([]);
            return;
        }

        try {
            const response = await axios.get(route(`${libraryRoutePrefix}.perpustakaan.reader.bookmarks`, selectedLoan.book.id));
            const fetchedBookmarks = (response.data.bookmarks ?? []) as LibraryBookmark[];
            setBookmarks(fetchedBookmarks.sort((a, b) => a.page_number - b.page_number));
        } catch {
            setBookmarks([]);
        }
    }, [libraryRoutePrefix, selectedLoan]);

    const loadComments = useCallback(async (): Promise<void> => {
        if (!selectedLoan) {
            setComments([]);
            return;
        }

        try {
            const response = await axios.get(route(`${libraryRoutePrefix}.perpustakaan.reader.comments`, selectedLoan.book.id));
            setComments((response.data.comments ?? []) as LibraryComment[]);
        } catch {
            setComments([]);
        }
    }, [libraryRoutePrefix, selectedLoan]);

    const saveBookmark = useCallback(async (): Promise<void> => {
        if (!selectedLoan || bookmarkProcessing) {
            return;
        }

        try {
            setBookmarkProcessing(true);
            const response = await axios.post(route(`${libraryRoutePrefix}.perpustakaan.reader.bookmarks.store`, selectedLoan.book.id), {
                page_number: currentPage,
                note: bookmarkNote.trim() === '' ? null : bookmarkNote.trim(),
            });
            const newBookmark = response.data.bookmark as LibraryBookmark;
            setBookmarks((previous) => {
                const withoutCurrent = previous.filter((item) => item.id !== newBookmark.id);
                return [...withoutCurrent, newBookmark].sort((a, b) => a.page_number - b.page_number);
            });
            setBookmarkNote('');
            toast.success(response.data.message ?? 'Bookmark pribadi tersimpan.');
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                toast.error('Pinjaman aktif tidak ditemukan.');
                return;
            }

            toast.error('Gagal menyimpan bookmark pribadi.');
        } finally {
            setBookmarkProcessing(false);
        }
    }, [bookmarkNote, bookmarkProcessing, currentPage, libraryRoutePrefix, selectedLoan]);

    const deleteBookmark = useCallback(async (bookmarkId: number): Promise<void> => {
        if (!selectedLoan) {
            return;
        }

        try {
            await axios.delete(route(`${libraryRoutePrefix}.perpustakaan.reader.bookmarks.destroy`, {
                book: selectedLoan.book.id,
                bookmark: bookmarkId,
            }));
            setBookmarks((previous) => previous.filter((item) => item.id !== bookmarkId));
            toast.success('Bookmark pribadi dihapus.');
        } catch {
            toast.error('Gagal menghapus bookmark.');
        }
    }, [libraryRoutePrefix, selectedLoan]);

    const sendComment = useCallback(async (): Promise<void> => {
        const trimmedComment = commentMessage.trim();
        if (!selectedLoan || trimmedComment === '' || commentProcessing) {
            return;
        }

        try {
            setCommentProcessing(true);
            const response = await axios.post(route(`${libraryRoutePrefix}.perpustakaan.reader.comments.store`, selectedLoan.book.id), {
                current_page: currentPage,
                comment: trimmedComment,
            });
            const newComment = response.data.comment as LibraryComment;
            setComments((previous) => [newComment, ...previous].slice(0, 80));
            setCommentMessage('');
            toast.success(response.data.message ?? 'Komentar berhasil dikirim.');
        } catch {
            toast.error('Gagal mengirim komentar.');
        } finally {
            setCommentProcessing(false);
        }
    }, [commentMessage, commentProcessing, currentPage, libraryRoutePrefix, selectedLoan]);

    useEffect(() => {
        if (!selectedLoan) return;
        void syncReader('join');
        void loadBookmarks();
        void loadComments();
        return () => {
            void syncReader('leave');
        };
    }, [loadBookmarks, loadComments, selectedLoan, syncReader]);

    useEffect(() => {
        if (!selectedLoan) return;
        void syncReader('page-change');
        void loadPresence(currentPage);
    }, [currentPage, loadPresence, selectedLoan, syncReader]);

    useEffect(() => {
        if (!selectedLoan) return;
        const heartbeatTimer = window.setInterval(() => {
            void syncReader('heartbeat');
        }, 15000);
        const presenceTimer = window.setInterval(() => {
            void loadPresence(currentPage);
        }, 10000);
        const commentsTimer = window.setInterval(() => {
            void loadComments();
        }, 12000);
        return () => {
            window.clearInterval(heartbeatTimer);
            window.clearInterval(presenceTimer);
            window.clearInterval(commentsTimer);
        };
    }, [currentPage, loadComments, loadPresence, selectedLoan, syncReader]);

    // Load PDF document
    useEffect(() => {
        if (!selectedLoan || view !== 'reader') {
            setPdfDocument(null);
            return;
        }

        const readerSource = route(`${libraryRoutePrefix}.perpustakaan.reader.file`, selectedLoan.book.id);
        setIsLoadingPdf(true);
        setPdfError(null);

        const loadingTask = pdfjsLib.getDocument({
            url: readerSource,
            withCredentials: true,
        });

        loadingTask.promise
            .then((pdf) => {
                setPdfDocument(pdf);
                setPdfPageCount(pdf.numPages);
                setIsLoadingPdf(false);
            })
            .catch((error: Error) => {
                console.error('PDF load error:', error);
                setPdfError(error.message || 'Gagal memuat PDF');
                setIsLoadingPdf(false);
            });

        return () => {
            setPdfDocument(null);
        };
    }, [libraryRoutePrefix, selectedLoan, view]);

    // Render PDF page
    useEffect(() => {
        if (!pdfDocument || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        pdfDocument.getPage(currentPage).then((page) => {
            const viewport = page.getViewport({ scale: pdfScale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const renderTask = page.render({
                canvasContext: context,
                viewport: viewport,
            } as any);
            void renderTask.promise;
        });
    }, [pdfDocument, currentPage, pdfScale]);

    // Responsive PDF scaling
    useEffect(() => {
        if (!readerWrapperRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            const containerWidth = Math.floor(entry.contentRect.width) - 32;
            const basePageWidth = 612;
            const newScale = Math.max(0.8, Math.min(1.5, containerWidth / basePageWidth));
            setPdfScale(newScale);
        });
        observer.observe(readerWrapperRef.current);
        return () => observer.disconnect();
    }, []);

    // Keyboard navigation
    const goToPrevPage = useCallback((): void => {
        setCurrentPage((page) => Math.max(page - 1, 1));
    }, []);

    const goToNextPage = useCallback((): void => {
        setCurrentPage((page) => Math.min(page + 1, pdfPageCount));
    }, [pdfPageCount]);

    const closeReader = useCallback((): void => {
        setView('library');
        setSelectedBook(null);
        setSelectedLoan(null);
        setPresenceParticipants([]);
        setBookmarks([]);
        setComments([]);
        setBookmarkNote('');
        setCommentMessage('');
    }, []);

    useEffect(() => {
        if (view !== 'reader' || !sideNavigationEnabled) return;
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                goToPrevPage();
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                goToNextPage();
            }
            if (event.key === 'Escape') {
                closeReader();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeReader, goToNextPage, goToPrevPage, sideNavigationEnabled, view]);

    // Return book
    const returnBook = useCallback((loanId: number) => {
        router.post(route(`${libraryRoutePrefix}.perpustakaan.loans.return`, loanId), {}, {
            onSuccess: () => toast.success('Buku berhasil dikembalikan'),
        });
    }, [libraryRoutePrefix]);

    // Total stats
    const totalActiveBooks = useMemo(() => books.filter(b => b.is_active).length, [books]);
    const totalActiveLoans = useMemo(() => loans.filter(l => l.status === 'active').length, [loans]);

    // Modern Book Card Component with Cover
    const BookCard = ({ book, loan }: { book: Book; loan: Loan | null }) => {
        const borrowed = !!loan;
        const colors = getBookColor(book.id);
        const progress = readingProgress[book.id];
        const progressPercent = progress ? Math.round((progress.current_page / book.total_pages) * 100) : 0;
        
        return (
            <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300">
                {/* Book Cover */}
                <div className={`${colors.bg} aspect-[3/4] relative overflow-hidden`}>
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />
                    
                    {/* Book Spine Effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/30 to-transparent" />
                    
                    {/* Top Info */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/95 ${colors.text} shadow-sm`}>
                            {book.category || 'Lainnya'}
                        </span>
                        {borrowed && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500 text-white shadow-sm">
                                Dipinjam
                            </span>
                        )}
                    </div>
                    
                    {/* Center Content - Title on Cover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-white text-lg leading-tight line-clamp-3 drop-shadow-lg">
                            {book.title}
                        </h3>
                    </div>
                    
                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white/90 text-xs font-medium">{book.author}</p>
                        <p className="text-white/70 text-xs">{book.total_pages} halaman</p>
                    </div>
                </div>
                
                {/* Card Body */}
                <div className="p-4">
                    {/* Progress Bar (if borrowed) */}
                    {borrowed && progress && (
                        <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500">Progress membaca</span>
                                <span className="text-slate-700 font-medium">{progressPercent}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Action Button */}
                    {borrowed ? (
                        <Button 
                            size="sm" 
                            className={`w-full ${colors.bg} hover:opacity-90 text-white`}
                            onClick={() => startReading(book, loan)}
                        >
                            <BookOpen className="w-4 h-4 mr-1.5" />
                            Lanjutkan Baca
                        </Button>
                    ) : (
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full border-slate-300 hover:bg-slate-50"
                            onClick={() => borrowBook(book)}
                        >
                            <Bookmark className="w-4 h-4 mr-1.5" />
                            Pinjam Buku
                        </Button>
                    )}

                    {canManageBooks && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={() => openEditBookForm(book)}
                            >
                                <Pencil className="w-3.5 h-3.5 mr-1" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-slate-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => deleteBook(book)}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Hapus
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Modern My Books Card
    const MyBookCard = ({ loan }: { loan: Loan }) => {
        const book = books.find(b => b.id === loan.book.id);
        if (!book) return null;
        
        const colors = getBookColor(book.id);
        const progress = readingProgress[book.id];
        const progressPercent = progress ? Math.round((progress.current_page / book.total_pages) * 100) : 0;
        const daysLeft = Math.ceil((new Date(loan.due_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                    {/* Book Icon */}
                    <div className={`${colors.light} ${colors.border} border rounded-lg p-3 flex-shrink-0`}>
                        <BookOpen className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    
                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm truncate">{book.title}</h4>
                        <p className="text-xs text-slate-500 mb-2">{book.author}</p>
                        
                        {/* Due Date Badge */}
                        <div className="flex items-center gap-2 mb-2">
                            <Clock3 className={`w-3 h-3 ${daysLeft < 3 ? 'text-rose-500' : 'text-slate-400'}`} />
                            <span className={`text-xs ${daysLeft < 3 ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
                                {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Jatuh tempo hari ini'}
                            </span>
                        </div>
                        
                        {/* Progress */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${colors.bg} rounded-full`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500">{progressPercent}%</span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                className={`flex-1 h-8 text-xs ${colors.bg} hover:opacity-90 text-white`}
                                onClick={() => startReading(book, loan)}
                            >
                                Baca
                            </Button>
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500"
                                onClick={() => returnBook(loan.id)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Reader View
    if (view === 'reader' && selectedLoan && selectedBook) {
        return (
            <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
                {/* Reader Header */}
                <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:text-white"
                            onClick={closeReader}
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Kembali
                        </Button>
                        
                        <div className="h-6 w-px bg-slate-700" />
                        
                        <div>
                            <h1 className="text-white font-medium text-sm">{selectedBook.title}</h1>
                            <p className="text-slate-400 text-xs">{selectedBook.author}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Page navigation */}
                        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                onClick={goToPrevPage}
                                disabled={currentPage <= 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-slate-300 min-w-[80px] text-center">
                                {currentPage} / {pdfPageCount}
                            </span>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                onClick={goToNextPage}
                                disabled={currentPage >= pdfPageCount}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <Button
                            variant={sideNavigationEnabled ? "default" : "outline"}
                            size="sm"
                            className={sideNavigationEnabled ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-slate-600 text-slate-300'}
                            onClick={() => setSideNavigationEnabled(v => !v)}
                        >
                            {sideNavigationEnabled ? 'Nav: On' : 'Nav: Off'}
                        </Button>
                    </div>
                </div>
                
                {/* Reader Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* PDF Viewer */}
                    <div ref={readerWrapperRef} className="flex-1 bg-slate-900 overflow-auto p-8">
                        <div className="max-w-4xl mx-auto">
                            {isLoadingPdf && (
                                <div className="flex h-[600px] items-center justify-center text-slate-500">
                                    <div className="text-center">
                                        <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                                        <p>Memuat dokumen PDF...</p>
                                    </div>
                                </div>
                            )}
                            {pdfError && !isLoadingPdf && (
                                <div className="flex h-[600px] items-center justify-center text-center text-red-400">
                                    <div>
                                        <FileText className="mx-auto mb-2 h-6 w-6" />
                                        <p>Gagal memuat PDF. Coba refresh halaman.</p>
                                        <p className="mt-2 text-xs text-slate-500">{pdfError}</p>
                                    </div>
                                </div>
                            )}
                            
                            <canvas
                                ref={canvasRef}
                                className={`mx-auto rounded shadow-2xl bg-white ${isLoadingPdf || pdfError ? 'hidden' : ''}`}
                            />
                        </div>
                        
                        {/* Side navigation buttons */}
                        {sideNavigationEnabled && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Halaman sebelumnya"
                                    className="fixed left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition"
                                    onClick={goToPrevPage}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Halaman berikutnya"
                                    className="fixed right-[364px] top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition"
                                    onClick={goToNextPage}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>
                            </>
                        )}
                    </div>
                    
                    <div className="w-[360px] bg-slate-900 border-l border-slate-800 flex flex-col">
                        <div className="p-4 border-b border-slate-800">
                            <h3 className="text-white font-medium flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Pembaca di Halaman {currentPage}
                            </h3>
                        </div>

                        <div className="flex-1 overflow-auto p-4 space-y-4">
                            <section className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 space-y-2">
                                {presenceParticipants.length === 0 ? (
                                    <p className="text-sm text-slate-500">Belum ada pembaca lain di halaman ini.</p>
                                ) : (
                                    presenceParticipants.map((participant) => {
                                        const participantName = participant.name || 'Pengguna';

                                        return (
                                            <div key={participant.user_id} className="flex items-center gap-3 rounded-lg bg-slate-900/70 p-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-medium">
                                                    {participantName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-200 truncate">{participantName}</p>
                                                    <p className="text-xs text-slate-500">Halaman {participant.current_page}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </section>

                            <section className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                        <StickyNote className="w-4 h-4 text-indigo-400" />
                                        Bookmark Pribadi
                                    </h4>
                                    <span className="text-xs text-slate-500">Halaman {currentPage}</span>
                                </div>

                                <textarea
                                    value={bookmarkNote}
                                    onChange={(event) => setBookmarkNote(event.target.value)}
                                    placeholder="Tulis catatan pribadi untuk halaman ini (opsional)"
                                    rows={3}
                                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                                />

                                <Button
                                    size="sm"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    disabled={bookmarkProcessing}
                                    onClick={() => void saveBookmark()}
                                >
                                    <Bookmark className="w-4 h-4 mr-1.5" />
                                    {bookmarkProcessing ? 'Menyimpan...' : 'Simpan Bookmark'}
                                </Button>

                                <div className="space-y-2 max-h-48 overflow-auto pr-1">
                                    {bookmarks.length === 0 ? (
                                        <p className="text-xs text-slate-500">Belum ada bookmark pribadi.</p>
                                    ) : (
                                        bookmarks.map((bookmark) => (
                                            <div key={bookmark.id} className="rounded-lg border border-slate-700 bg-slate-900/80 p-2 space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        className="text-xs font-medium text-indigo-300 hover:text-indigo-200"
                                                        onClick={() => setCurrentPage(bookmark.page_number)}
                                                    >
                                                        Halaman {bookmark.page_number}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="text-xs text-rose-300 hover:text-rose-200"
                                                        onClick={() => void deleteBookmark(bookmark.id)}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                                {bookmark.note && (
                                                    <p className="text-xs text-slate-300 whitespace-pre-wrap">{bookmark.note}</p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 space-y-3">
                                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                                    Komentar Pembaca
                                </h4>

                                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                                    {comments.length === 0 ? (
                                        <p className="text-xs text-slate-500">Belum ada komentar untuk buku ini.</p>
                                    ) : (
                                        comments.map((comment) => {
                                            const commenterName = comment.user?.name || 'Pengguna';
                                            const commenterInitial = commenterName.charAt(0).toUpperCase();
                                            const isOwnComment = comment.user_id === auth.user?.id;

                                            return (
                                                <div key={comment.id} className="rounded-lg border border-slate-700 bg-slate-900/80 p-2">
                                                    <div className="flex items-start gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center">
                                                            {commenterInitial}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className={`text-xs font-medium ${isOwnComment ? 'text-indigo-300' : 'text-slate-300'}`}>{commenterName}</p>
                                                                {comment.current_page !== null && (
                                                                    <span className="text-[11px] text-slate-500">Hal {comment.current_page}</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-200 whitespace-pre-wrap">{comment.comment}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <textarea
                                        value={commentMessage}
                                        onChange={(event) => setCommentMessage(event.target.value)}
                                        placeholder="Tulis komentar untuk pembaca lain..."
                                        rows={3}
                                        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                                    />
                                    <Button
                                        size="sm"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                        disabled={commentProcessing || commentMessage.trim() === ''}
                                        onClick={() => void sendComment()}
                                    >
                                        <Send className="w-4 h-4 mr-1.5" />
                                        {commentProcessing ? 'Mengirim...' : 'Kirim Komentar'}
                                    </Button>
                                </div>
                            </section>
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-800/30">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Info Buku</h4>
                            <div className="space-y-1 text-xs text-slate-400">
                                <p>Total Halaman: {selectedBook.total_pages}</p>
                                <p>Kategori: {selectedBook.category || '-'}</p>
                                <p>Jatuh Tempo: {new Date(selectedLoan.due_at).toLocaleDateString('id-ID')}</p>
                                <p>Bookmark Pribadi: {bookmarks.length}</p>
                                <p>Total Komentar: {comments.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Add Book View
    if (view === 'add-book') {
        if (!canManageBooks) {
            return (
                <AdminLayout title="Perpustakaan Digital">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                        <p className="text-sm text-slate-500">Anda tidak memiliki akses ke fitur tambah buku.</p>
                        <Button className="mt-4" onClick={() => setView('library')}>
                            Kembali ke Perpustakaan
                        </Button>
                    </div>
                </AdminLayout>
            );
        }

        return (
            <AdminLayout title={editingBook ? 'Edit Buku - Perpustakaan' : 'Tambah Buku - Perpustakaan'}>
                <div className="max-w-4xl mx-auto">
                    <Button 
                        variant="ghost" 
                        className="mb-4"
                        onClick={() => {
                            setEditingBook(null);
                            setView('library');
                        }}
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Kembali ke Perpustakaan
                    </Button>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
                            <h1 className="text-xl font-semibold text-white">{editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}</h1>
                            <p className="text-indigo-100 text-sm">
                                {editingBook ? 'Perbarui metadata buku digital perpustakaan' : 'Tambahkan buku digital ke perpustakaan'}
                            </p>
                        </div>
                        
                        <form onSubmit={submitBook} className="p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Buku *</Label>
                                    <Input 
                                        id="title" 
                                        value={bookForm.data.title} 
                                        onChange={(e) => bookForm.setData('title', e.target.value)}
                                        placeholder="Masukkan judul buku"
                                    />
                                    {bookForm.errors.title && <p className="text-xs text-red-500">{bookForm.errors.title}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="author">Penulis *</Label>
                                    <Input 
                                        id="author" 
                                        value={bookForm.data.author} 
                                        onChange={(e) => bookForm.setData('author', e.target.value)}
                                        placeholder="Masukkan nama penulis"
                                    />
                                    {bookForm.errors.author && <p className="text-xs text-red-500">{bookForm.errors.author}</p>}
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Input 
                                        id="category" 
                                        value={bookForm.data.category} 
                                        onChange={(e) => bookForm.setData('category', e.target.value)}
                                        placeholder="Contoh: Fiksi, Sains, Sejarah"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="total_pages">Total Halaman *</Label>
                                    <Input 
                                        id="total_pages" 
                                        type="number"
                                        min={1}
                                        value={bookForm.data.total_pages} 
                                        onChange={(e) => bookForm.setData('total_pages', Number(e.target.value))}
                                    />
                                    {bookForm.errors.total_pages && <p className="text-xs text-red-500">{bookForm.errors.total_pages}</p>}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Input 
                                    id="description" 
                                    value={bookForm.data.description} 
                                    onChange={(e) => bookForm.setData('description', e.target.value)}
                                    placeholder="Deskripsi singkat tentang buku"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="pdf_file">{editingBook ? 'File PDF (opsional)' : 'File PDF *'}</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <Input 
                                        id="pdf_file" 
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={(e) => bookForm.setData('pdf_file', e.target.files?.[0] ?? null)}
                                    />
                                    <label htmlFor="pdf_file" className="cursor-pointer">
                                        <span className="text-indigo-600 font-medium">Klik untuk upload</span>
                                        <span className="text-slate-500"> atau drag and drop file PDF</span>
                                    </label>
                                    {editingBook && !bookForm.data.pdf_file && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Biarkan kosong jika tidak ingin mengganti file PDF.
                                        </p>
                                    )}
                                    {bookForm.data.pdf_file && (
                                        <p className="text-sm text-emerald-600 mt-2">
                                            {bookForm.data.pdf_file.name}
                                        </p>
                                    )}
                                </div>
                                {bookForm.errors.pdf_file && <p className="text-xs text-red-500">{bookForm.errors.pdf_file}</p>}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Status Buku</p>
                                    <p className="text-xs text-slate-500">Buku nonaktif tetap tersimpan tapi tidak muncul untuk dipinjam.</p>
                                </div>
                                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={bookForm.data.is_active}
                                        onChange={(e) => bookForm.setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Aktif
                                </label>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => {
                                        setEditingBook(null);
                                        setView('library');
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={bookForm.processing}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {bookForm.processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            {editingBook ? <Pencil className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                                            {editingBook ? 'Simpan Perubahan' : 'Simpan Buku'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Main Library View - Modern Design
    return (
        <AdminLayout title="Perpustakaan Digital">
            <div className="min-h-screen bg-slate-50">
                {/* Modern Header */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium mb-1">
                                    <Library className="w-4 h-4" />
                                    <span>Digital Library</span>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900">Perpustakaan Digital</h1>
                                <p className="text-slate-500 text-sm mt-0.5">
                                    Kelola dan akses buku digital dalam satu tempat
                                </p>
                            </div>
                            
                            {/* Stats */}
                            <div className="flex gap-3">
                                <div className="bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
                                    <p className="text-2xl font-bold text-slate-900">{totalActiveBooks}</p>
                                    <p className="text-xs text-slate-500">Buku Tersedia</p>
                                </div>
                                <div className="bg-indigo-50 rounded-lg px-4 py-2 border border-indigo-100">
                                    <p className="text-2xl font-bold text-indigo-600">{totalActiveLoans}</p>
                                    <p className="text-xs text-indigo-600/70">Sedang Dipinjam</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {canManageBooks && (
                        <div className="flex justify-end mb-4">
                            <Button 
                                className="bg-indigo-600 hover:bg-indigo-700"
                                onClick={openAddBookForm}
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Tambah Buku
                            </Button>
                        </div>
                    )}
                    
                    {/* My Books Section */}
                    {myActiveLoans.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <BookMarked className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-3xl font-semibold text-slate-900">Buku Saya</h2>
                                    <span className="text-sm text-slate-500">{myActiveLoans.length} dipinjam</span>
                                </div>
                                <button
                                    type="button"
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                    onClick={() => setStatusFilter('borrowed')}
                                >
                                    Lihat Semua {'->'}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {myActiveLoans.map((loan) => (
                                    <MyBookCard key={loan.id} loan={loan} />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                        <aside className="space-y-6 border-r border-slate-200 pr-6">
                            <div className="space-y-2">
                                <p className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">Pencarian</p>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Cari buku..."
                                        className="pl-10 bg-white"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">Kategori Populer</p>
                                <button
                                    type="button"
                                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                                        !selectedCategory ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    <span>Semua Buku</span>
                                    <span>{categoryCounts['Semua Buku'] ?? 0}</span>
                                </button>
                                {categories.map((category) => (
                                    <button
                                        type="button"
                                        key={category}
                                        className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                                            selectedCategory === category
                                                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        <span>{category}</span>
                                        <span>{categoryCounts[category]}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold tracking-[0.16em] text-slate-400 uppercase">Status</p>
                                <button
                                    type="button"
                                    className={`w-full text-left rounded-lg px-3 py-2 text-sm ${statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    className={`w-full text-left rounded-lg px-3 py-2 text-sm ${statusFilter === 'available' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                    onClick={() => setStatusFilter('available')}
                                >
                                    Hanya Tersedia
                                </button>
                                <button
                                    type="button"
                                    className={`w-full text-left rounded-lg px-3 py-2 text-sm ${statusFilter === 'borrowed' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                    onClick={() => setStatusFilter('borrowed')}
                                >
                                    Sedang Dipinjam
                                </button>
                            </div>
                        </aside>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-2xl font-bold text-slate-900">Eksplorasi Buku</h2>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span>Urutkan:</span>
                                    <select
                                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as 'latest' | 'title')}
                                    >
                                        <option value="latest">Terbaru</option>
                                        <option value="title">Judul A-Z</option>
                                    </select>
                                </div>
                            </div>

                            {filteredFlatBooks.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                                    <Library className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-700">Tidak ada buku ditemukan</h3>
                                    <p className="text-slate-500">Coba ubah filter pencarian atau kategori.</p>
                                </div>
                            ) : (
                                <div
                                    className="grid gap-5"
                                    style={{
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                    }}
                                >
                                    {filteredFlatBooks.map((book) => (
                                        <BookCard
                                            key={book.id}
                                            book={book}
                                            loan={getLoanForBook(book.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                    
                    {/* Footer Stats */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <p className="text-3xl font-bold text-slate-900">{books.length}</p>
                                <p className="text-sm text-slate-500">Total Buku</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <p className="text-3xl font-bold text-indigo-600">{myActiveLoans.length}</p>
                                <p className="text-sm text-slate-500">Pinjaman Saya</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <p className="text-3xl font-bold text-emerald-600">{categories.length}</p>
                                <p className="text-sm text-slate-500">Kategori</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <p className="text-3xl font-bold text-violet-600">{presenceParticipants.length}</p>
                                <p className="text-sm text-slate-500">Sedang Membaca</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
