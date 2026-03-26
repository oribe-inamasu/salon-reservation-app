"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Save, Loader2, Check, CalendarDays, UserCircle, Key, Mail, User } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { createUserAction, updateUserAction, deleteUserAction } from "../actions";

export type StaffMember = {
    id: string;
    name: string;
    color: string;
};

export type UserAccount = {
    id: string;
    name: string | null;
    email: string | null;
};

const DEFAULT_COLORS = [
    "bg-emerald-500",
    "bg-pink-500",
    "bg-purple-500",
    "bg-blue-500",
    "bg-orange-500",
    "bg-sky-500",
    "bg-rose-500",
    "bg-stone-800",
];

const DAYS_OF_WEEK = [
    { id: 1, label: "月" },
    { id: 2, label: "火" },
    { id: 3, label: "水" },
    { id: 4, label: "木" },
    { id: 5, label: "金" },
    { id: 6, label: "土" },
    { id: 0, label: "日" },
];

export default function StaffSettingsTab({
    initialData,
    initialClosedDays,
    users,
    onSave,
    onSaveClosedDays,
}: {
    initialData?: StaffMember[];
    initialClosedDays?: number[];
    users: UserAccount[];
    onSave: (data: StaffMember[]) => Promise<boolean>;
    onSaveClosedDays: (days: number[]) => Promise<boolean>;
}) {
    // Basic fallback to constant if no data exists in DB yet
    const [staffList, setStaffList] = useState<StaffMember[]>(initialData || []);

    const [closedDays, setClosedDays] = useState<number[]>(initialClosedDays || [3]);

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Account Management State
    const [accountList] = useState<UserAccount[]>(users);
    const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [authError, setAuthError] = useState("");

    // Account Actions
    const handleEditUser = (user: UserAccount) => {
        setEditingUser(user);
        setFormData({ name: user.name || "", email: user.email || "", password: "", confirmPassword: "" });
        setAuthError("");
    };

    const handleAddUser = () => {
        setIsCreating(true);
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
        setAuthError("");
    };

    const handleUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");

        if (!formData.email || !formData.name) {
            setAuthError("名前とメールアドレスは必須です");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setAuthError("パスワードが一致しません");
            return;
        }

        setIsSaving(true);
        let result;
        if (isCreating) {
            if (!formData.password) {
                setAuthError("新規登録にはパスワードが必要です");
                setIsSaving(false);
                return;
            }
            result = await createUserAction(formData);
        } else if (editingUser) {
            result = await updateUserAction(editingUser.id, formData);
        }

        setIsSaving(false);
        if (result?.success) {
            window.location.reload(); 
        } else {
            setAuthError(result?.error || "エラーが発生しました");
        }
    };

    const handleDeleteUserSource = async (id: string) => {
        if (!confirm("本当にこのアカウントを削除しますか？")) return;
        setIsSaving(true);
        const result = await deleteUserAction(id);
        setIsSaving(false);
        if (result.success) {
            window.location.reload();
        } else {
            alert(result.error);
        }
    };

    const handleAddStaff = () => {
        const newStaff: StaffMember = {
            id: crypto.randomUUID(),
            name: "新しいスタッフ",
            color: DEFAULT_COLORS[staffList.length % DEFAULT_COLORS.length],
        };
        setStaffList([...staffList, newStaff]);
    };

    const handleRemoveStaff = (id: string) => {
        setStaffList(staffList.filter((s) => s.id !== id));
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(staffList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setStaffList(items);
    };

    const handleChange = (id: string, field: keyof StaffMember, value: string) => {
        setStaffList(staffList.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const handleToggleDay = (dayId: number) => {
        setClosedDays(prev => {
            const newDays = prev.includes(dayId)
                ? prev.filter(d => d !== dayId)
                : [...prev, dayId];
            return newDays.sort();
        });
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        const [staffSuccess, closedDaysSuccess] = await Promise.all([
            onSave(staffList),
            onSaveClosedDays(closedDays)
        ]);
        setIsSaving(false);
        if (staffSuccess && closedDaysSuccess) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-foreground">スタッフ管理</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        予約やカルテの担当者として選択できるスタッフを設定します。ドラッグして順番を入れ替えられます。
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden text-sm">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="staff-list">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="p-4 space-y-3"
                            >
                                {staffList.map((staff, index) => (
                                    <Draggable key={staff.id} draggableId={staff.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 group transition-shadow shadow-sm",
                                                    snapshot.isDragging && "shadow-lg ring-2 ring-primary/20 z-50 relative"
                                                )}
                                            >
                                                <div
                                                    {...provided.dragHandleProps}
                                                    className="p-1 text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing transition-colors"
                                                    title="ドラッグして移動"
                                                >
                                                    <GripVertical className="w-5 h-5" />
                                                </div>

                                                <div className="flex-1 flex flex-col sm:flex-row gap-3">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={staff.name}
                                                            onChange={(e) => handleChange(staff.id, "name", e.target.value)}
                                                            className="w-full bg-stone-50 text-stone-900 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow font-sans"
                                                            placeholder="スタッフ名"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={staff.color}
                                                            onChange={(e) => handleChange(staff.id, "color", e.target.value)}
                                                            className="bg-stone-50 text-stone-900 border border-stone-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none min-w-[120px] font-sans"
                                                        >
                                                            {DEFAULT_COLORS.map(color => (
                                                                <option key={color} value={color}>{color.replace('bg-', '')}</option>
                                                            ))}
                                                        </select>
                                                        <div className={`w-8 h-8 rounded-full ${staff.color} border-2 border-white shadow-sm flex-shrink-0`} />
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleRemoveStaff(staff.id)}
                                                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                                    title="削除"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                <div className="p-4 border-t border-stone-100 bg-stone-50">
                    <button
                        onClick={handleAddStaff}
                        className="flex items-center gap-2 text-primary font-bold hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        スタッフを追加
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center gap-2 mb-4">
                    <CalendarDays className="w-5 h-5 text-stone-400" />
                    <h3 className="font-bold text-stone-700">定休日（曜日）</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                        const isSelected = closedDays.includes(day.id);
                        return (
                            <button
                                key={day.id}
                                type="button"
                                onClick={() => handleToggleDay(day.id)}
                                className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${isSelected
                                    ? "bg-red-500 text-white shadow-md scale-110"
                                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                                    }`}
                            >
                                {day.label}
                            </button>
                        );
                    })}
                </div>
                <p className="mt-4 text-xs text-stone-400 font-medium">
                    選択した曜日は予約カレンダー上で休診日として表示されます。
                </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-stone-400" />
                        <h3 className="font-bold text-stone-700">ログインアカウント管理</h3>
                    </div>
                    {!isCreating && !editingUser && (
                        <button
                            onClick={handleAddUser}
                            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                        >
                            <Plus className="w-3 h-3" /> アカウント追加
                        </button>
                    )}
                </div>

                {(isCreating || editingUser) ? (
                    <form onSubmit={handleUserSubmit} className="space-y-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 flex items-center gap-1">
                                    <User className="w-3 h-3" /> 表示名
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                                    placeholder="管理者 A"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> メールアドレス (ID)
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 flex items-center gap-1">
                                    <Key className="w-3 h-3" /> {editingUser ? "新しいパスワード (省略可)" : "パスワード"}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-stone-500 flex items-center gap-1">
                                    <Key className="w-3 h-3" /> パスワード確認用
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {authError && <div className="text-xs text-red-500 font-bold">{authError}</div>}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsCreating(false); setEditingUser(null); }}
                                className="px-4 py-2 text-sm font-bold text-stone-500 hover:bg-stone-200 rounded-xl transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md disabled:opacity-50"
                            >
                                {isSaving ? "処理中..." : (isCreating ? "作成する" : "更新する")}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-2">
                        {accountList.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-stone-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-stone-800">{user.name}</div>
                                        <div className="text-xs text-stone-500">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditUser(user)}
                                        className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        編集
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUserSource(user.id)}
                                        className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                                        title="アカウント削除"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 py-3 px-8 bg-primary text-primary-foreground font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 min-w-[200px]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            保存中...
                        </>
                    ) : saveSuccess ? (
                        <>
                            <Check className="w-5 h-5" />
                            保存しました
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            設定を保存
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}
