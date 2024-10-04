"use client";

import { cn } from "@/lib/utils";
import CustomLink from "@/components/costum-link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { HomeIcon, AlertTriangle, FileText, PieChart, Settings } from "lucide-react";

export function MainNav() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;


    return (
        <div className="flex gap-6 items-center relative">
            <div className="hidden md:flex gap-6 items-center"> {/* md以上で横並び */}
                <CustomLink href="/">
                    <div className={`hover:text-blue-400 ${isActive('/') ? 'border-b-2 border-blue-500' : ''}`}>ホーム</div>
                </CustomLink>
                <CustomLink href="/create">
                    <div className={`hover:text-blue-400 ${isActive('/create') ? 'border-b-2 border-blue-500' : ''}`}>作成</div>
                </CustomLink>
                <CustomLink href="/reports">
                    <div className={`hover:text-blue-400 ${isActive('/reports') ? 'border-b-2 border-blue-500' : ''}`}>一覧</div>
                </CustomLink>
                <CustomLink href="/analytics">
                    <div className={`hover:text-blue-400 ${isActive('/analytics') ? 'border-b-2 border-blue-500' : ''}`}>分析</div>
                </CustomLink>
                <CustomLink href="/settings">
                    <div className={`hover:text-blue-400 ${isActive('/settings') ? 'border-b-2 border-blue-500' : ''}`}>設定</div>
                </CustomLink>
            </div>

            <div className="flex items-center md:hidden space-x-4"> {/* スマホ用のメニュー */}
                <CustomLink href="/">
                    <div className={`md:hidden text-center`}>
                        <HomeIcon className="text-gray-700" />
                        <div className={`text-xs hover:text-blue-400 ${isActive('/') ? 'border-b-2 border-blue-500' : ''}`}>ホーム</div>
                    </div>
                </CustomLink>
                <CustomLink href="/create">
                    <div className={`md:hidden text-center`}>
                        <AlertTriangle className="text-red-700" />
                        <div className={`text-xs hover:text-blue-400 ${isActive('/create') ? 'border-b-2 border-blue-500' : ''}`}>作成</div>
                    </div>
                </CustomLink>
                <CustomLink href="/reports">
                    <div className={`md:hidden text-center`}>
                        <FileText className="text-blue-500" />
                        <div className={`text-xs hover:text-blue-400 ${isActive('/reports') ? 'border-b-2 border-blue-500' : ''}`}>一覧</div>
                    </div>
                </CustomLink>
                <CustomLink href="/analytics">
                    <div className={`md:hidden text-center`}>
                        <PieChart className="text-green-500" />
                        <div className={`text-xs hover:text-blue-400 ${isActive('/analytics') ? 'border-b-2 border-blue-500' : ''}`}>分析</div>
                    </div>
                </CustomLink>
                <CustomLink href="/settings">
                    <div className={`md:hidden text-center`}>
                        <Settings className="text-gray-500" />
                        <div className={`text-xs hover:text-blue-400 ${isActive('/settings') ? 'border-b-2 border-blue-500' : ''}`}>設定</div>
                    </div>
                </CustomLink>
            </div>
        </div>
    );
}
