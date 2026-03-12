"use client";

import { useState, useMemo } from "react";
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
    addDays,
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
    JapaneseYen
} from "lucide-react";
import { deleteBooking, updateBooking, convertToVisit, createBooking } from "./actions";
import { CheckCircle2 } from "lucide-react";



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
    price: number | null;
    memo: string | null;
    staff: string | null;
    status: string;
};

type CustomerShort = {
    id: string;
    name: string;
    attribute_label: string | null;
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
    initialBookings: any[];
    customers: CustomerShort[];
    serviceNames: string[];
    staffNames: string[];
    staffColorMap: Record<string, string>;
    customerLabels: CustomerLabel[];
    clinicInfo: ClinicInfo;
    serviceCourses: ServiceCourse[];
    optionServices: OptionService[];
}) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookings, setBookings] = useState<BookingWithCustomer[]>(initialBookings.map(b => ({
        ...b,
        start_time: new Date(b.start_time),
        end_time: new Date(b.end_time)
    })));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formCustomerId, setFormCustomerId] = useState(customers[0]?.id || "");
    const [formStartTime, setFormStartTime] = useState("10:00");
    const [formEndTime, setFormEndTime] = useState("11:00");
    const [formCategory, setFormCategory] = useState<string>(serviceNames[0] || "");
    const [formPrice, setFormPrice] = useState("5000");
    const [formStaff, setFormStaff] = useState("");
    const [formMemo, setFormMemo] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");

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
        return selectedDateBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    }, [selectedDateBookings]);

    const currentMonthBookings = useMemo(() => {
        return bookings.filter(b => isSameMonth(b.start_time, currentMonth));
    }, [bookings, currentMonth]);

    const monthlyTotalSales = useMemo(() => {
        return currentMonthBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    }, [currentMonthBookings]);

    const handleAddClick = () => {
        setFormMode("create");
        setFormCustomerId(customers[0]?.id || "");
        setFormStartTime("10:00");
        setFormEndTime("11:00");
        setFormCategory(serviceNames[0] || "");
        setFormPrice("5000");
        setFormStaff("");
        setFormMemo("");
        setSelectedCourseId("");
        setIsModalOpen(true);
    };

    const handleEditClick = (booking: BookingWithCustomer) => {
        setFormMode("edit");
        setEditingId(booking.id);
        setFormCustomerId(booking.customerId);
        setFormStartTime(format(booking.start_time, "HH:mm"));
        setFormEndTime(format(booking.end_time, "HH:mm"));
        setFormCategory(booking.treatment_category || serviceNames[0] || "");
        setFormPrice(String(booking.price || 0));
        setFormStaff(booking.staff || "");
        setFormMemo(booking.memo || "");
        setSelectedCourseId(""); // We don't track the course ID in the booking itself currently
        setIsModalOpen(true);
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

        if (formMode === "create") {
            const result = await createBooking({
                customerId: formCustomerId,
                start_time: start,
                end_time: end,
                treatment_category: formCategory,
                price: price,
                staff: formStaff || undefined,
                memo: formMemo,
            });

            if (result.success && result.booking) {
                const customer = customers.find(c => c.id === formCustomerId)!;
                const newBooking = {
                    ...result.booking,
                    start_time: new Date(result.booking.start_time),
                    end_time: new Date(result.booking.end_time),
                    customer
                } as unknown as BookingWithCustomer;
                setBookings([...bookings, newBooking]);
                setIsModalOpen(false);
            }
        } else if (formMode === "edit" && editingId) {
            const result = await updateBooking(editingId, {
                customerId: formCustomerId,
                start_time: start,
                end_time: end,
                treatment_category: formCategory,
                price: price,
                staff: formStaff || undefined,
                memo: formMemo,
            });

            if (result.success && result.booking) {
                const customer = customers.find(c => c.id === formCustomerId)!;
                setBookings(bookings.map(b => b.id === editingId ? {
                    ...result.booking,
                    start_time: new Date(result.booking.start_time),
                    end_time: new Date(result.booking.end_time),
                    customer
                } as unknown as BookingWithCustomer : b));
                setIsModalOpen(false);
            }
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("この予約を削除してもよろしいですか？")) return;
        setIsSubmitting(true);
        const result = await deleteBooking(id);
        if (result.success) {
            setBookings(bookings.filter(b => b.id !== id));
            setIsModalOpen(false); // Close modal after deletion
        }
        setIsSubmitting(false);
    };

    const handleConvertToVisit = async (id: string, price: number) => {
        setIsSubmitting(true);
        const result = await convertToVisit(id, price);
        if (result.success) {
            setBookings(bookings.map(b => b.id === id ? { ...b, status: "completed" } : b));
        } else {
            alert(result.error);
        }
        setIsSubmitting(false);
    };

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
                        {calendarDays.map((day, i) => {
                            const isSelected = isSameDay(day, selectedDate);
                            const hasBooking = bookings.some(b => isSameDay(b.start_time, day));
                            const isClosedDay = clinicInfo.closedDays.includes(day.getDay());

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
                                    {hasBooking && (
                                        <div className="absolute bottom-1.5 flex gap-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                    {/* Monthly Summary */}
                    <div className="bg-stone-100 border-b px-4 py-2 flex items-center justify-between text-sm text-stone-600">
                        <span className="font-bold">{format(currentMonth, "yyyy年M月", { locale: ja })} の合計</span>
                        <div className="flex items-center gap-4 font-bold">
                            <span>{currentMonthBookings.length} 件</span>
                            <span className="text-stone-700">¥{monthlyTotalSales.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Daily Summary */}
                    <div className="bg-white/95 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-stone-700">
                                {format(selectedDate, "yyyy年M月d日(E)", { locale: ja })}
                            </span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-blue-600">{selectedDateBookings.length}</span>
                                <span className="text-xs text-stone-400 font-bold">件</span>
                            </div>
                            <div className="text-xl font-bold text-stone-700">
                                ¥{dailyTotalSales.toLocaleString()}
                            </div>
                        </div>
                        <button
                            onClick={handleAddClick}
                            className="p-1 px-3 bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Appointment List */}
                <div className="divide-y border-b">
                    {selectedDateBookings.length === 0 ? (
                        <div className="p-20 text-center text-stone-300">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">予約がありません</p>
                        </div>
                    ) : (
                        selectedDateBookings.map((booking) => {
                            const labelInfo = booking.customer.attribute_label ? customerLabels.find(l => l.id === booking.customer.attribute_label) : null;
                            const hexColor = labelInfo?.color;

                            const staffBgClass = booking.staff ? staffColorMap[booking.staff] : undefined;

                            return (
                                <div
                                    key={booking.id}
                                    onClick={() => handleEditClick(booking)}
                                    className={`flex flex-col hover:bg-stone-50 transition-colors cursor-pointer group relative overflow-hidden border-b border-stone-100 last:border-b-0 ${booking.status === 'completed' ? 'bg-stone-50/50' : ''}`}
                                >
                                    {/* Main Card Content */}
                                    <div className="p-3 sm:p-4 flex gap-3 sm:gap-4 items-stretch">
                                        {/* 1. Left: Time Column */}
                                        <div className="w-14 sm:w-16 flex flex-col items-center justify-start py-0.5 sm:py-1 flex-shrink-0 border-r border-stone-100 pr-2 sm:pr-4">
                                            <div className="text-base sm:text-lg font-bold text-stone-700 leading-none mb-1">
                                                {format(booking.start_time, "HH:mm")}
                                            </div>
                                            <div className="text-xs sm:text-sm font-semibold text-stone-400 leading-none">
                                                {format(booking.end_time, "HH:mm")}
                                            </div>
                                        </div>

                                        {/* 2. Center: Info Column */}
                                        <div className="flex-1 flex flex-col justify-start min-w-0 py-0.5">
                                            {/* Name & Labels */}
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <div className="text-base sm:text-lg font-bold text-stone-800 truncate">
                                                    {booking.customer.name} 様
                                                </div>
                                                {/* Customer Attribute Label */}
                                                {hexColor && (
                                                    <div
                                                        className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold whitespace-nowrap"
                                                        style={{ backgroundColor: `${hexColor}1A`, color: hexColor }}
                                                    >
                                                        {labelInfo?.name}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details: Staff and Menu */}
                                            <div className="flex flex-col gap-1.5 mt-auto pt-1">
                                                {booking.treatment_category && (
                                                    <div className="text-xs sm:text-sm text-stone-500 truncate font-medium" title={booking.treatment_category}>
                                                        {booking.treatment_category}
                                                    </div>
                                                )}
                                                {booking.staff && (
                                                    <div>
                                                        <span
                                                            className={`inline-block text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm ${!staffBgClass ? 'bg-stone-100 text-stone-600' : `${staffBgClass} text-white`}`}
                                                        >
                                                            担当: {booking.staff}
                                                        </span>
                                                    </div>
                                                )}
                                                {booking.memo && (
                                                    <div className="text-xs text-stone-400 italic line-clamp-1 mt-1 border-l-2 border-stone-200 pl-2">
                                                        {booking.memo}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 3. Right: Price & Desktop Action */}
                                        <div className="flex flex-col justify-between items-end flex-shrink-0 pl-2 sm:pl-4 py-0.5">
                                            <div className="text-lg sm:text-xl font-bold text-blue-600 leading-none mb-2">
                                                ¥{(booking.price || 0).toLocaleString()}
                                            </div>

                                            {/* Desktop Status Action */}
                                            <div className="hidden sm:block mt-auto">
                                                {booking.status === "completed" ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-100">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        来店済み
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleConvertToVisit(booking.id, booking.price || 0);
                                                        }}
                                                        className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors px-3 py-1.5 rounded-lg shadow-sm"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        お会計へ
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Mobile Action Footer */}
                                    <div className="sm:hidden border-t border-stone-100 bg-stone-50/50 p-2.5 flex justify-end">
                                        {booking.status === "completed" ? (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50/80 px-4 py-2 rounded-lg border border-emerald-100 w-full justify-center">
                                                <CheckCircle2 className="w-4 h-4" />
                                                来店済み
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleConvertToVisit(booking.id, booking.price || 0);
                                                }}
                                                className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 transition-colors px-4 py-2 rounded-lg shadow-sm w-full active:scale-[0.98]"
                                            >
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                タップして来店済みにする（お会計）
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
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
                                    <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">開始時間</label>
                                    <input
                                        type="time"
                                        value={formStartTime}
                                        onChange={(e) => setFormStartTime(e.target.value)}
                                        className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">終了時間</label>
                                    <input
                                        type="time"
                                        value={formEndTime}
                                        onChange={(e) => setFormEndTime(e.target.value)}
                                        className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">メニュー</label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full p-3 bg-stone-50 text-stone-900 border-stone-200 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                                    >
                                        <option value="">（コースから選択）</option>
                                        {serviceNames.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">クイック選択：コース</label>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => {
                                            const courseId = e.target.value;
                                            setSelectedCourseId(courseId);
                                            const course = serviceCourses.find(c => c.id === courseId);
                                            if (course) {
                                                setFormCategory(course.name);
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
                                        <PlusCircle className="w-3 h-3 text-emerald-500" /> クイック追加：オプション・割引
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {optionServices.map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormPrice(prev => String(parseInt(prev || "0") + option.price));

                                                    if (option.duration !== 0) {
                                                        const [h, m] = formEndTime.split(":").map(Number);
                                                        const time = new Date();
                                                        time.setHours(h, m, 0, 0);
                                                        const newTime = new Date(time.getTime() + option.duration * 60000);
                                                        setFormEndTime(format(newTime, "HH:mm"));
                                                    }
                                                }}
                                                className="px-3 py-2 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold hover:bg-emerald-100 hover:text-emerald-700 transition-all border border-stone-200"
                                            >
                                                {option.name} ({option.price > 0 ? "+" : ""}{option.price.toLocaleString()}円)
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-stone-400 mt-2">※クリックすると現在の金額・終了時間に加算されます。</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-stone-400 mb-1.5 uppercase tracking-wider">担当スタッフ（任意）</label>
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

                            <div className="pt-2 flex gap-3 flex-shrink-0">
                                {formMode === "edit" && (
                                    <button
                                        type="button"
                                        onClick={() => editingId && handleDelete(editingId)}
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
