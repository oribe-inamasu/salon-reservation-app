"use client";

import { useState, useMemo, useEffect } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday
} from "date-fns";
import { ja } from "date-fns/locale";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    User,
    X,
    Calendar as CalendarIcon,
    Trash2,
    PlusCircle,
    Check,
    Cake
} from "lucide-react";
import Link from "next/link";
import { deleteBooking, updateBooking, convertToVisit, createBooking, revertVisit } from "./actions";
import { CheckCircle2, ChevronRight as ChevronRightIcon, RotateCcw } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { calculateTotalPrice } from "@/lib/utils";
import { calculateAge } from "@/lib/date-utils";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type BookingWithCustomer = {
    id: string;
    customerId: string;
    customer: {
        name: string;
        id: string;
        attribute_label: string | null;
    };
    start_time: Date;
    end_time: Date;
    treatment_category: string | null;
    treatment_content: string | null;
    price: number | null;
    memo: string | null;
    staff: string | null;
    status: string;
    adjustment_price: number;
    payment_method?: string | null;
    options?: string | null;
};

type CustomerShort = {
    id: string;
    name: string;
    attribute_label: string | null;
    birth_date: string | null;
};

import type { CustomerLabel, ClinicInfo, ServiceCourse, OptionService } from "@/lib/settings";

export default function CalendarClient({
    initialBookings,
    customers,
    serviceNames,
    staffNames,
    staffColorMap,
    customerLabels,
    clinicInfo,
    serviceCourses,
    optionServices,
}: {
    initialBookings: (Omit<BookingWithCustomer, 'start_time' | 'end_time'> & { start_time: string | Date; end_time: string | Date })[];
    customers: CustomerShort[];
    serviceNames: string[];
    staffNames: string[];
    staffColorMap: Record<string, string>;
    customerLabels: CustomerLabel[];
    clinicInfo: ClinicInfo;
    serviceCourses: ServiceCourse[];
    optionServices: OptionService[];
}) {
    // Use null for initial dates to avoid hydration mismatch
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2000, 0, 1)); // Placeholder
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(2000, 0, 1)); // Placeholder
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
        setIsMounted(true);
    }, []);

    const [bookings, setBookings] = useState<BookingWithCustomer[]>(initialBookings.map(b => ({
        ...b,
        start_time: new Date(b.start_time),
        end_time: new Date(b.end_time)
    })));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<"bookings" | "birthdays">("bookings");
    const [expandedBookingIds, setExpandedBookingIds] = useState<Set<string>>(new Set());
    const [isMonthlySummaryExpanded, setIsMonthlySummaryExpanded] = useState(false);
    const [isDailySummaryExpanded, setIsDailySummaryExpanded] = useState(false);

    // Form State
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formCustomerId, setFormCustomerId] = useState(customers[0]?.id || "");
    const [formStartTime, setFormStartTime] = useState("10:00");
    const [formEndTime, setFormEndTime] = useState("11:00");
    const [formCategory, setFormCategory] = useState<string>(serviceNames[0] || "");
    const [formContent, setFormContent] = useState<string>("");
    const [formPrice, setFormPrice] = useState("5000");
    const [formStaff, setFormStaff] = useState("");
    const [formMemo, setFormMemo] = useState("");
    const [formAdjustment, setFormAdjustment] = useState("0");
    const [formPaymentMethod, setFormPaymentMethod] = useState<string>("現金");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<{ id: string, optionId: string }[]>([]);

    // Calendar logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const selectedDateBookings = useMemo(() => {
        return bookings
            .filter(b => isSameDay(b.start_time, selectedDate))
            .sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
    }, [bookings, selectedDate]);

    const dailyTotalSales = useMemo(() => {
        return selectedDateBookings
            .filter(b => b.status === "completed")
            .reduce((sum, b) => sum + (b.price || 0), 0);
    }, [selectedDateBookings]);

    const currentMonthBookings = useMemo(() => {
        return bookings.filter(b => isSameMonth(b.start_time, currentMonth));
    }, [bookings, currentMonth]);

    const currentMonthCompletedBookings = useMemo(() => {
        return currentMonthBookings.filter(b => b.status === "completed");
    }, [currentMonthBookings]);

    const monthlyTotalSales = useMemo(() => {
        return currentMonthCompletedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    }, [currentMonthCompletedBookings]);

    const dailyAverageSpend = useMemo(() => {
        if (selectedDateBookings.length === 0) return 0;
        return Math.floor(dailyTotalSales / selectedDateBookings.length);
    }, [dailyTotalSales, selectedDateBookings]);
    
    const dailySalesByPayment = useMemo(() => {
        const methods = ["現金", "カード", "電子マネー", "その他"];
        return methods.map(method => {
            const total = selectedDateBookings
                .filter(b => (b.payment_method || "現金") === method)
                .reduce((sum, b) => sum + (b.price || 0), 0);
            return { name: method, value: total };
        }).filter(item => item.value > 0);
    }, [selectedDateBookings]);


    const monthlyAverageSpend = useMemo(() => {
        if (currentMonthBookings.length === 0) return 0;
        return Math.floor(monthlyTotalSales / currentMonthBookings.length);
    }, [monthlyTotalSales, currentMonthBookings]);

    // Birthday Logic
    const selectedDateBirthdays = useMemo(() => {
        const targetMMDD = format(selectedDate, "MM-dd");
        return customers.filter(c => c.birth_date?.endsWith(targetMMDD));
    }, [customers, selectedDate]);


    const handleAddClick = () => {
        setFormMode("create");
        setFormCustomerId(customers[0]?.id || "");
        setFormStartTime("10:00");
        setFormEndTime("11:00");
        setFormCategory(serviceNames[0] || "");
        setFormContent(serviceCourses.find(c => c.name === serviceNames[0] || c.category === serviceNames[0])?.name || "");
        setFormPrice("5000");
        setFormStaff("");
        setFormMemo("");
        setFormAdjustment("0");
        setFormPaymentMethod("現金");
        setSelectedCourseId("");
        setSelectedOptions([]);
        setIsModalOpen(true);
    };

    const handleEditClick = (booking: BookingWithCustomer) => {
        setFormMode("edit");
        setEditingId(booking.id);
        setFormCustomerId(booking.customerId);
        setFormStartTime(format(booking.start_time, "HH:mm"));
        setFormEndTime(format(booking.end_time, "HH:mm"));
        setFormCategory(booking.treatment_category || "");
        setFormContent(booking.treatment_content || "");
        setFormAdjustment(String(booking.adjustment_price || 0));
        setFormPaymentMethod(booking.payment_method || "現金");
        setFormStaff(booking.staff || "");
        setFormMemo(booking.memo || "");

        // Set initial course based on treatment content (precise) or category
        const course = serviceCourses.find(c => c.name === booking.treatment_content) || 
                       serviceCourses.find(c => c.category === booking.treatment_category);
        setSelectedCourseId(course?.id || "");

        // Parse options from the new options field, or fallback to memo for old data
        let initialOptions: string[] = [];
        if (booking.options) {
            try {
                initialOptions = JSON.parse(booking.options);
            } catch (e) {
                console.error("Failed to parse booking options:", e);
            }
        } else {
            initialOptions = optionServices
                .filter(opt => booking.memo?.includes(`[${opt.name}]`))
                .map(opt => opt.id);
        }
        
        setSelectedOptions(initialOptions.map(id => ({ id: crypto.randomUUID(), optionId: id })));

        setIsModalOpen(true);
    };

    const addOption = () => {
        setSelectedOptions(prev => [...prev, { id: crypto.randomUUID(), optionId: "" }]);
    };

// ... (inside the component)

    const updatePrice = (courseId: string, options: { optionId: string }[], adj: string) => {
        const total = calculateTotalPrice(courseId, options, adj, serviceCourses, optionServices);
        setFormPrice(String(total));
    };

    const removeOption = (id: string) => {
        const optionItem = selectedOptions.find(o => o.id === id);
        if (optionItem && optionItem.optionId) {
            const option = optionServices.find(o => o.id === optionItem.optionId);
            if (option && option.duration !== 0) {
                const [h, m] = formEndTime.split(":").map(Number);
                const time = new Date();
                time.setHours(h, m, 0, 0);
                const newTime = new Date(time.getTime() - option.duration * 60000);
                setFormEndTime(format(newTime, "HH:mm"));
            }
        }
        const newOptions = selectedOptions.filter(o => o.id !== id);
        setSelectedOptions(newOptions);
        updatePrice(selectedCourseId, newOptions, formAdjustment);
    };

    const updateOption = (id: string, newOptionId: string) => {
        const optionItem = selectedOptions.find(o => o.id === id);
        const oldOption = optionItem?.optionId ? optionServices.find(o => o.id === optionItem.optionId) : null;
        const newOption = newOptionId ? optionServices.find(o => o.id === newOptionId) : null;

        const oldDuration = oldOption ? oldOption.duration : 0;
        const newDuration = newOption ? newOption.duration : 0;
        if (oldDuration !== newDuration) {
            const [h, m] = formEndTime.split(":").map(Number);
            const time = new Date();
            time.setHours(h, m, 0, 0);
            const newTime = new Date(time.getTime() - oldDuration * 60000 + newDuration * 60000);
            setFormEndTime(format(newTime, "HH:mm"));
        }

        const newOptions = selectedOptions.map(o => o.id === id ? { ...o, optionId: newOptionId } : o);
        setSelectedOptions(newOptions);
        updatePrice(selectedCourseId, newOptions, formAdjustment);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formStartTime >= formEndTime) {
            alert("開始時間は終了時間より前に設定してください。");
            return;
        }

        setIsSubmitting(true);

        const start = new Date(selectedDate);
        const [startH, startM] = formStartTime.split(":").map(Number);
        start.setHours(startH, startM, 0, 0);

        const end = new Date(selectedDate);
        const [endH, endM] = formEndTime.split(":").map(Number);
        end.setHours(endH, endM, 0, 0);

        const price = parseInt(formPrice) || 0;
        const optionIdList = selectedOptions.map(o => o.optionId).filter(id => id !== "");
        const optionsJson = optionIdList.length > 0 ? JSON.stringify(optionIdList) : null;

        if (formMode === "create") {
            const result = await createBooking({
                customerId: formCustomerId,
                start_time: start,
                end_time: end,
                treatment_category: formCategory,
                treatment_content: formContent,
                price: price,
                adjustment_price: parseInt(formAdjustment) || 0,
                payment_method: formPaymentMethod,
                staff: formStaff || undefined,
                memo: formMemo,
                options: optionsJson ?? undefined,
            });

            if (result.success && result.booking) {
                const customer = customers.find(c => c.id === formCustomerId)!;
                const newBooking = {
                    ...result.booking,
                    start_time: new Date(result.booking.start_time),
                    end_time: new Date(result.booking.end_time),
                    customer
                } as unknown as BookingWithCustomer;
                setBookings(prev => [...prev, newBooking]);
                setIsModalOpen(false);
            } else {
                alert(result.error || "予約の登録に失敗しました");
            }
        } else if (formMode === "edit" && editingId) {
            const result = await updateBooking(editingId, {
                customerId: formCustomerId,
                start_time: start,
                end_time: end,
                treatment_category: formCategory,
                treatment_content: formContent,
                price: price,
                adjustment_price: parseInt(formAdjustment) || 0,
                payment_method: formPaymentMethod,
                staff: formStaff || undefined,
                memo: formMemo,
                options: optionsJson ?? undefined,
            });

            if (result.success && result.booking) {
                const customer = customers.find(c => c.id === formCustomerId)!;
                setBookings(prev => prev.map(b => b.id === editingId ? {
                    ...result.booking,
                    start_time: new Date(result.booking.start_time),
                    end_time: new Date(result.booking.end_time),
                    customer
                } as unknown as BookingWithCustomer : b));
                setIsModalOpen(false);
                setEditingId(null);
            } else {
                alert(result.error || "予約の更新に失敗しました");
            }
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        const confirmMessage = "この予約を削除してもよろしいですか？\n\n【ご注意】\n※この予約に関連付けられた「カルテ（来店履歴）」がある場合、それらも同時に削除されます。";
        if (!window.confirm(confirmMessage)) return;
        
        console.log(`[CalendarClient] Initiating deletion for booking ${id}`);
        setIsSubmitting(true);
        try {
            const result = await deleteBooking(id);
            if (result.success) {
                console.log(`[CalendarClient] Delete successful for ${id}`);
                setBookings(prev => prev.filter(b => b.id !== id));
                setIsModalOpen(false);
                setEditingId(null);
                
                // Optional: Show a subtle success toast if you had a toast system
                // For now, just ensuring the UI is closed is good feedback.
            } else {
                console.error(`[CalendarClient] Delete failed for ${id}:`, result.error);
                alert(result.error || "予約の削除に失敗しました");
            }
        } catch (err) {
            console.error(`[CalendarClient] Unexpected error during deletion of ${id}:`, err);
            alert("通信エラーが発生しました。時間を置いて再度お試しください。");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedBookingIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleConvertToVisit = async (id: string, price: number, payment_method?: string) => {
        setIsSubmitting(true);
        const result = await convertToVisit(id, price, payment_method);
        if (result.success) {
            setBookings(prev => prev.map(b => 
                b.id === id 
                    ? { ...b, status: "completed", price: price, payment_method: payment_method || b.payment_method } 
                    : b
            ));
            // Close any open detail view
            setExpandedBookingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } else {
            alert(result.error);
        }
        setIsSubmitting(false);
    };

    if (!isMounted) return null;

    return (
        <div className="flex flex-col min-h-screen pb-20 bg-white">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-emerald-700 text-white shadow-md">
                <div className="flex items-center h-14 px-4 justify-between">
                    <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold">
                        {format(currentMonth, "yyyy年 M月", { locale: ja })}
                    </h1>
                    <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Toggle Switch & Add Button Area */}
            <div className="bg-stone-50 px-4 py-2 flex items-center justify-center border-b relative">
                <div className="flex bg-stone-200 p-1 rounded-xl w-full max-w-[280px]">
                    <button
                        onClick={() => setViewMode("bookings")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all",
                            viewMode === "bookings" ? "bg-white text-emerald-700 shadow-sm" : "text-stone-500 hover:text-stone-700"
                        )}
                    >
                        <Clock className="w-4 h-4" />
                        予約
                    </button>
                    <button
                        onClick={() => setViewMode("birthdays")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-bold transition-all",
                            viewMode === "birthdays" ? "bg-white text-pink-600 shadow-sm" : "text-stone-500 hover:text-stone-700"
                        )}
                    >
                        <Cake className="w-4 h-4" />
                        誕生日
                    </button>
                </div>
                {viewMode === "bookings" && (
                    <button
                        onClick={handleAddClick}
                        className="absolute right-4 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>

            <main className="flex-1 space-y-0">
                {/* Calendar Grid */}
                <div className="bg-white border-b overflow-hidden">
                    <div className="grid grid-cols-7 border-b bg-stone-50">
                        {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                            <div key={day} className={`py-2 text-center text-xs font-bold ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-stone-400"}`}>
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day) => {
                            const isSelected = isSameDay(day, selectedDate);
                            const hasBooking = bookings.some(b => isSameDay(b.start_time, day));
                            const isClosedDay = clinicInfo.closedDays.includes(day.getDay());
                            const hasBirthday = customers.some(c => c.birth_date?.endsWith(format(day, "MM-dd")));

                            return (
                                <button
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        h-14 border-b border-r last:border-r-0 relative flex flex-col items-center justify-center transition-all
                                        ${!isSameMonth(day, monthStart) ? "bg-stone-50 text-stone-300" : "text-stone-700"}
                                        ${isSelected ? "bg-emerald-50 font-bold" : "hover:bg-stone-50"}
                                        ${isClosedDay ? "bg-stone-100 text-stone-400 opacity-70" : ""}
                                    `}
                                >
                                    <span className={`text-sm ${isToday(day) ? "w-7 h-7 flex items-center justify-center bg-emerald-600 text-white rounded-full" : ""}`}>
                                        {format(day, "d")}
                                    </span>
                                    {hasBooking && viewMode === "bookings" && (
                                        <div className="absolute bottom-1.5 flex gap-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        </div>
                                    )}
                                    {hasBirthday && viewMode === "birthdays" && (
                                        <div className="absolute bottom-1.5 flex gap-0.5">
                                            <Cake className="w-3 h-3 text-pink-500" />
                                        </div>
                                    )}
                                    {isSelected && (
                                        <div className="absolute top-0 left-0 w-full h-full border-2 border-emerald-600/30 pointer-events-none" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sticky Summary Area */}
                <div className="sticky top-14 z-30 flex flex-col shadow-sm">
                    {/* Monthly Summary (Only in Bookings Mode) */}
                    {viewMode === "bookings" && (
                        <div className="bg-stone-100 border-b overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setIsMonthlySummaryExpanded(!isMonthlySummaryExpanded)}
                                className="w-full px-4 py-2 flex items-center justify-between text-sm text-stone-600 hover:bg-stone-200/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <ChevronRightIcon className={cn("w-4 h-4 text-stone-400 transition-transform duration-300", isMonthlySummaryExpanded && "rotate-90")} />
                                    <span className="font-bold">{format(currentMonth, "yyyy年M月", { locale: ja })} の合計</span>
                                </div>
                                <div className="flex items-center gap-4 font-bold">
                                    <span>{currentMonthBookings.length} 件</span>
                                    <span className="text-stone-700">¥{monthlyTotalSales.toLocaleString()}</span>
                                </div>
                            </button>
                            
                            {isMonthlySummaryExpanded && (
                                <div className="px-4 pb-3 pt-1 flex flex-col gap-1 border-t border-stone-200/50 bg-stone-50/50 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex justify-between items-center text-xs ml-6">
                                        <span className="text-stone-400 font-bold uppercase tracking-wider">月間客単価 (ARPU)</span>
                                        <span className="font-bold text-stone-700">¥{monthlyAverageSpend.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs ml-6">
                                        <span className="text-stone-400 font-bold uppercase tracking-wider">予約成約率</span>
                                        <span className="font-bold text-stone-700">
                                            {currentMonthBookings.length > 0 ? Math.round((currentMonthBookings.filter(b => b.status === "completed").length / currentMonthBookings.length) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Daily Summary */}
                    <div className="bg-white/95 backdrop-blur-md border-b flex flex-col shadow-sm">
                        <div className="px-4 py-3 flex items-center justify-between">
                            <button 
                                onClick={() => viewMode === "bookings" && setIsDailySummaryExpanded(!isDailySummaryExpanded)}
                                className="flex-1 flex items-center justify-between hover:bg-stone-50 transition-colors -ml-1 pl-1"
                            >
                                <div className="flex items-baseline gap-2">
                                    {viewMode === "bookings" && (
                                        <ChevronRightIcon className={cn("w-4 h-4 text-stone-400 transition-transform duration-300", isDailySummaryExpanded && "rotate-90")} />
                                    )}
                                    <span className="text-lg font-bold text-stone-700">
                                        {format(selectedDate, "M/d(E)", { locale: ja })}
                                    </span>
                                    {viewMode === "bookings" && (
                                        <div className="flex items-baseline gap-0.5 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">
                                            <span className="text-xs font-bold text-blue-600">{selectedDateBookings.length}</span>
                                            <span className="text-[10px] text-blue-400 font-bold">件</span>
                                        </div>
                                    )}
                                </div>
                                {viewMode === "bookings" ? (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-stone-400 font-medium">合計</span>
                                        <span className="text-lg font-bold text-stone-700">¥{dailyTotalSales.toLocaleString()}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-pink-600">{selectedDateBirthdays.length}</span>
                                        <span className="text-xs text-stone-400 font-bold">名が誕生日です 🎂</span>
                                    </div>
                                )}
                            </button>
                        </div>
                        
                        {isDailySummaryExpanded && viewMode === "bookings" && (
                            <div className="px-4 pb-3 pt-1 flex flex-col gap-1 border-t border-stone-100 bg-stone-50/50 animate-in slide-in-from-top-2 duration-300">
                                {selectedDateBookings.length > 0 && (
                                    <div className="flex justify-between items-center text-xs ml-6">
                                        <span className="text-stone-400 font-bold uppercase tracking-wider">日間客単価</span>
                                        <span className="font-bold text-stone-700">¥{dailyAverageSpend.toLocaleString()}</span>
                                    </div>
                                )}
                                
                                <div className="mt-2 pt-1 border-t border-stone-200/30">
                                    <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest ml-6 mb-1.5">
                                        支払い方法別内訳
                                    </div>
                                    <div className="flex flex-col gap-1 ml-6">
                                        {dailySalesByPayment.length > 0 ? (
                                            dailySalesByPayment.map((item) => (
                                                <div key={item.name} className="flex justify-between items-center text-xs">
                                                    <span className="text-stone-500 font-medium">{item.name}</span>
                                                    <span className="font-bold text-stone-700">¥{item.value.toLocaleString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-[10px] text-stone-400 italic py-1">売上データがありません</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* List View */}
                <div className="divide-y border-b">
                    {viewMode === "bookings" ? (
                        selectedDateBookings.length === 0 ? (
                            <div className="p-20 text-center text-stone-300">
                                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">予約がありません</p>
                            </div>
                        ) : (
                            selectedDateBookings.map((booking) => {
                                const staffBgClass = booking.staff ? staffColorMap[booking.staff] : undefined;
                                const isExpanded = expandedBookingIds.has(booking.id);

                                return (
                                    <div
                                        key={booking.id}
                                        onClick={(e) => toggleExpand(booking.id, e)}
                                        className={`flex flex-col hover:bg-stone-50 transition-colors cursor-pointer group relative overflow-hidden border-b border-stone-100 last:border-b-0 ${booking.status === 'completed' ? 'bg-stone-50/50' : ''}`}
                                    >
                                        {/* Compact Card Content */}
                                        <div className="p-2 sm:p-3 flex gap-3 items-center">
                                            {/* 1. Time */}
                                            <div className="w-12 flex-shrink-0 text-center">
                                                <div className="text-sm font-bold text-stone-700 leading-none">
                                                    {format(booking.start_time, "HH:mm")}
                                                </div>
                                            </div>

                                            {/* 2. Customer Name & Staff Name */}
                                            <div className="flex-1 min-w-0 flex items-center gap-2">
                                                <div className="text-sm font-bold text-stone-800 truncate">
                                                    {booking.customer.name} 様
                                                </div>
                                                {booking.staff && (
                                                    <span
                                                        className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${!staffBgClass ? 'bg-stone-100 text-stone-600' : `${staffBgClass} text-white`}`}
                                                    >
                                                        {booking.staff}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Payment Method */}
                                            <div className="flex-shrink-0 mr-1">
                                                <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded border border-stone-200 shadow-sm">
                                                    {booking.payment_method || "現金"}
                                                </span>
                                            </div>

                                            {/* 3. Price & Chevron */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="text-sm font-bold text-blue-600">
                                                    ¥{(booking.price || 0).toLocaleString()}
                                                </div>
                                                <ChevronRightIcon className={cn("w-4 h-4 text-stone-300 transition-transform", isExpanded && "rotate-90")} />
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="px-3 pb-3 pt-1 bg-stone-50/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="flex flex-col gap-2 pl-12">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        {booking.treatment_category && (
                                                            <div className="text-xs text-stone-600 flex items-center gap-1">
                                                                <CalendarIcon className="w-3 h-3 text-stone-400" />
                                                                {booking.treatment_category}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-stone-400">
                                                            予約時間: {format(booking.start_time, "HH:mm")} 〜 {format(booking.end_time, "HH:mm")}
                                                        </div>
                                                    </div>

                                                    {booking.options && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {(() => {
                                                                try {
                                                                    const selectedOptionIds = JSON.parse(booking.options) as string[];
                                                                    return selectedOptionIds.map((optId, idx) => {
                                                                        const opt = optionServices.find(o => o.id === optId);
                                                                        if (!opt) return null;
                                                                        return (
                                                                            <span key={`${optId}-${idx}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-[9px] font-bold rounded-full border border-blue-100 dark:border-blue-800">
                                                                                <PlusCircle className="w-2.5 h-2.5" />
                                                                                {opt.name}
                                                                            </span>
                                                                        );
                                                                    });
                                                                } catch (e) {
                                                                    return null;
                                                                }
                                                            })()}
                                                        </div>
                                                    )}

                                                    {booking.memo && (
                                                        <div className="text-xs text-stone-500 italic border-l-2 border-stone-200 pl-2 py-0.5 whitespace-pre-wrap">
                                                            {booking.memo}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 mt-1">
                                                        {booking.status !== "completed" ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleConvertToVisit(booking.id, booking.price || 0, booking.payment_method || "現金");
                                                                }}
                                                                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 py-2 rounded-lg shadow-sm"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                お会計へ
                                                            </button>
                                                        ) : (
                                                             <button
                                                                 onClick={async (e) => {
                                                                     e.stopPropagation();
                                                                     if (confirm("来店処理を取り消しますか？\n（売上データも削除されます）")) {
                                                                         const res = await revertVisit(booking.id);
                                                                         if (res.success) {
                                                                             setBookings(prev => prev.map(b => 
                                                                                 b.id === booking.id ? { ...b, status: "pending" } : b
                                                                             ));
                                                                         } else {
                                                                             alert(res.error || "取消に失敗しました");
                                                                         }
                                                                     }
                                                                 }}
                                                                 className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50/80 hover:bg-red-50 hover:text-red-600 transition-colors py-2 rounded-lg border border-emerald-100 hover:border-red-100"
                                                             >
                                                                 <CheckCircle2 className="w-3.5 h-3.5" />
                                                                 来店済み
                                                             </button>
                                                         )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditClick(booking);
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 py-2 rounded-lg shadow-sm"
                                                        >
                                                            <User className="w-3.5 h-3.5" />
                                                            詳細・編集
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )
                    ) : (
                        // Birthday List
                        selectedDateBirthdays.length === 0 ? (
                            <div className="p-20 text-center text-stone-300">
                                <Cake className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">お誕生日の顧客はいません</p>
                            </div>
                        ) : (
                            selectedDateBirthdays.map((customer) => {
                                const labelInfo = customer.attribute_label ? customerLabels.find(l => l.id === customer.attribute_label) : null;
                                const hexColor = labelInfo?.color;
                                const age = customer.birth_date ? calculateAge(customer.birth_date, selectedDate) : null;

                                return (
                                    <Link
                                        key={customer.id}
                                        href={`/customers/${customer.id}`}
                                        className="flex items-center p-4 hover:bg-pink-50 transition-colors border-b border-stone-100 last:border-b-0 group"
                                    >
                                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                            <Cake className="w-6 h-6 text-pink-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg font-bold text-stone-800 truncate">
                                                    {customer.name} 様
                                                </span>
                                                {hexColor && (
                                                    <div
                                                        className="px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap"
                                                        style={{ backgroundColor: `${hexColor}1A`, color: hexColor }}
                                                    >
                                                        {labelInfo?.name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm text-stone-500 flex items-center gap-2 font-medium">
                                                <span className="text-pink-600 font-bold">本日お誕生日です！</span>
                                                {age !== null && (
                                                    <span className="bg-stone-100 px-2 py-0.5 rounded text-xs text-stone-600">
                                                        祝 {age} 歳
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRightIcon className="w-5 h-5 text-stone-300" />
                                    </Link>
                                );
                            })
                        )
                    )}
                </div>
            </main>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[90dvh]">
                        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                            <h3 className="font-bold text-stone-700">
                                {formMode === "create" ? "新規予約の登録" : "予約の編集"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-100 rounded-full">
                                <X className="w-5 h-5 text-stone-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">顧客</label>
                                <select
                                    value={formCustomerId}
                                    onChange={(e) => setFormCustomerId(e.target.value)}
                                    className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    required
                                >
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} 様</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">時間（開始）</label>
                                    <input
                                        type="time"
                                        value={formStartTime}
                                        onChange={(e) => setFormStartTime(e.target.value)}
                                        className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">時間（終了）</label>
                                    <input
                                        type="time"
                                        value={formEndTime}
                                        onChange={(e) => setFormEndTime(e.target.value)}
                                        className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">担当スタッフ</label>
                                <select
                                    value={formStaff}
                                    onChange={(e) => setFormStaff(e.target.value)}
                                    className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                >
                                    <option value="">指名なし</option>
                                    {staffNames.map(member => (
                                        <option key={member} value={member}>{member}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">コース</label>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => {
                                        const courseId = e.target.value;
                                        setSelectedCourseId(courseId);
                                        const course = serviceCourses.find(c => c.id === courseId);
                                        if (course) {
                                            setFormCategory(course.category || course.name);
                                            setFormContent(course.name);
                                            setFormPrice(String(course.price));
                                            // Update end time
                                            const [h, m] = formStartTime.split(":").map(Number);
                                            const startDate = new Date();
                                            startDate.setHours(h, m, 0, 0);
                                            const newEndDate = new Date(startDate.getTime() + course.duration * 60000);
                                            setFormEndTime(format(newEndDate, "HH:mm"));
                                        }
                                    }}
                                    className="w-full p-3 bg-emerald-50 text-emerald-900 border-emerald-200 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                >
                                    <option value="">コースを選択して自動入力</option>
                                    {serviceCourses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.name} ({course.duration}分 / ¥{course.price.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-2 border-t pt-4">
                                <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                                    <PlusCircle className="w-3 h-3 text-emerald-500" /> オプション・割引
                                </label>
                                <div className="space-y-3">
                                    {selectedOptions.map((opt, index) => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <select
                                                value={opt.optionId}
                                                onChange={(e) => updateOption(opt.id, e.target.value)}
                                                className="flex-1 p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                            >
                                                <option value="">オプション・割引を選択</option>
                                                {optionServices.map(option => (
                                                    <option key={option.id} value={option.id}>
                                                        {option.name} ({option.price > 0 ? "+" : ""}{option.price.toLocaleString()}円)
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => removeOption(opt.id)}
                                                className="p-3 bg-stone-100 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="w-full py-3 border-2 border-dashed border-stone-200 text-stone-500 font-bold rounded-xl hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> オプションを追加
                                    </button>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-2">※コース選択と同じ方法で選べるようになりました。複数の同じオプションを追加することも可能です。</p>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">登録外の調整額（例：-500, +1000）</label>
                                <input
                                    type="number"
                                    value={formAdjustment}
                                    onChange={(e) => {
                                        const newAdjustment = e.target.value;
                                        const diff = (parseInt(newAdjustment) || 0) - (parseInt(formAdjustment) || 0);
                                        setFormAdjustment(newAdjustment);
                                        setFormPrice(prev => String(Math.max(0, parseInt(prev || "0") + diff)));
                                    }}
                                    className="w-full p-3 bg-amber-50 text-amber-900 border-amber-200 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500/50 outline-none"
                                    placeholder="0"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">支払い方法</label>
                                <select
                                    value={formPaymentMethod}
                                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                                    className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                >
                                    <option value="現金">現金</option>
                                    <option value="カード">カード</option>
                                    <option value="電子マネー">電子マネー</option>
                                    <option value="その他">その他</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">メモ</label>
                                <textarea
                                    value={formMemo}
                                    onChange={(e) => setFormMemo(e.target.value)}
                                    className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none min-h-[80px]"
                                    placeholder="特記事項があれば入力"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">施術料金 (¥)</label>
                                <input
                                    type="number"
                                    value={formPrice}
                                    onChange={(e) => setFormPrice(e.target.value)}
                                    className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    required
                                />
                            </div>

                            <div className="pt-2 flex gap-3 flex-shrink-0">
                                {formMode === "edit" && (
                                    <button
                                        type="button"
                                        onClick={(e) => editingId && handleDelete(editingId, e)}
                                        className="p-4 bg-stone-100 text-stone-400 rounded-2xl hover:bg-stone-200 active:scale-[0.98] transition-all"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? "処理中..." : formMode === "create" ? "予約を確定する" : "変更を保存する"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }
        </div >
    );
}
