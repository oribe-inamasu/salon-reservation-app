"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateUserAction(id: string, data: { name?: string; email?: string; password?: string }) {
    try {
        const updateData: { name?: string; email?: string; password?: string } = {}
        if (data.name) updateData.name = data.name
        if (data.email) updateData.email = data.email
        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10)
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        })

        revalidatePath("/settings")
        return { success: true }
    } catch (error) {
        console.error("Update user error:", error)
        return { success: false, error: "更新に失敗しました" }
    }
}

export async function createUserAction(data: { name: string; email: string; password: string }) {
    try {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword
            }
        })

        revalidatePath("/settings")
        return { success: true }
    } catch (error) {
        console.error("Create user error:", error)
        return { success: false, error: "作成に失敗しました。メールアドレスが重複している可能性があります。" }
    }
}

export async function deleteUserAction(id: string) {
    try {
        // 最低1人はユーザーを残す必要があるためチェック
        const count = await prisma.user.count()
        if (count <= 1) {
            return { success: false, error: "これ以上ユーザーを削除できません（最低1人は必要です）" }
        }

        await prisma.user.delete({
            where: { id }
        })

        revalidatePath("/settings")
        return { success: true }
    } catch (error) {
        console.error("Delete user error:", error)
        return { success: false, error: "削除に失敗しました" }
    }
}
