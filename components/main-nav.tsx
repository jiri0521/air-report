"use client";

import CustomLink from "@/components/costum-link";
import React from "react";
import { usePathname } from "next/navigation";
import { HomeIcon, FileText, PieChart, Pen } from "lucide-react";

export function MainNav() {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;


    return (
        <div className="flex gap-6 items-center relative">
            <div className="hidden md:flex gap-6 items-center"> {/* md以上で横並び */}
               
                <CustomLink href="/">
                    <div className={`border py-1 px-1 rounded-xl hover:text-blue-400 ${isActive('/') ? 'border-b-2 border-blue-500' : ''}`}>ホーム</div>
                </CustomLink>
                <CustomLink href="/create">
                    <div className={`border py-1 px-1 rounded-xl hover:text-blue-400 ${isActive('/create') ? 'border-b-2 border-blue-500' : ''}`}>作成</div>
                </CustomLink>
                <CustomLink href="/reports">
                    <div className={`border py-1 px-1 rounded-xl hover:text-blue-400 ${isActive('/reports') ? 'border-b-2 border-blue-500' : ''}`}>一覧</div>
                </CustomLink>
                <CustomLink href="/near-miss-reports">
                    <div className={`border py-1 px-1 rounded-xl hover:text-blue-400 ${isActive('/near-miss-reports') ? 'border-b-2 border-blue-500' : ''}`}>ヒヤリ</div>
                </CustomLink>
                <CustomLink href="/accident-reports">
                    <div className={`border py-1 px-1 rounded-xl hover:text-blue-400 ${isActive('/accident-reports') ? 'border-b-2 border-blue-500' : ''}`}>事故</div>
                </CustomLink>
                <CustomLink href="/analytics">
                    <div className={`border py-1 px-1 rounded-xl hover:text-blue-400 ${isActive('/analytics') ? 'border-b-2 border-blue-500' : ''}`}>分析</div>
                </CustomLink>               
            </div>

            <div className="flex items-center md:hidden space-x-4"> {/* スマホ用のメニュー */}
                <CustomLink href="/">
                    <div className={`md:hidden text-center`}>
                        <HomeIcon className="text-gray-700" />
                        <div className={`text-xs text-gray-500 hover:text-blue-400 ${isActive('/') ? 'border-b-2 border-blue-500' : ''}`}>ホーム</div>
                    </div>
                </CustomLink>
                <CustomLink href="/create">
                    <div className={`md:hidden text-center`}>
                        <Pen className="text-red-700" />
                        <div className={`text-xs text-gray-500 hover:text-blue-400 ${isActive('/create') ? 'border-b-2 border-blue-500' : ''}`}>作成</div>
                    </div>
                </CustomLink>
                <CustomLink href="/reports">
                    <div className={`md:hidden text-center`}>
                        <FileText className="text-blue-500" />
                        <div className={`text-xs text-gray-500 hover:text-blue-400 ${isActive('/reports') ? 'border-b-2 border-blue-500' : ''}`}>一覧</div>
                    </div>
                </CustomLink>
                <CustomLink href="/near-miss-reports">
                    <div className={`md:hidden text-center`}>
                        <FileText className="text-yellow-500" />
                        <div className={`text-xs text-gray-500 hover:text-blue-400 ${isActive('/near-miss-reports') ? 'border-b-2 border-blue-500' : ''}`}>ヒヤリ</div>
                    </div>
                </CustomLink>
                <CustomLink href="/accident-reports">
                    <div className={`md:hidden text-center`}>
                        <FileText className="text-red-300" />
                        <div className={`text-xs text-gray-500 hover:text-blue-400 ${isActive('/accident-reports') ? 'border-b-2 border-blue-500' : ''}`}>事故</div>
                    </div>
                </CustomLink>
                <CustomLink href="/analytics">
                    <div className={`md:hidden text-center`}>
                        <PieChart className="text-green-500" />
                        <div className={`text-xs text-gray-500 hover:text-blue-400 ${isActive('/analytics') ? 'border-b-2 border-blue-500' : ''}`}>分析</div>
                    </div>
                </CustomLink>                
            </div>
        </div>
    );
}
