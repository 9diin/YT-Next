"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useAtom } from "jotai";
import { sidebarStateAtom } from "@/store"; // 위에서 만든 atom을 임포트
// Shadcn UI
import { Button } from "@/components/ui/button";
import { Dot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
// CSS
import styles from "./SideNavigation.module.scss";
import { SearchBar } from "@/components/ui/search-bar";

function SideNavigation() {
    const router = useRouter();
    const [todos, setTodos] = useState<any>([]);
    const { toast } = useToast();
    const [sidebarState, setSidebarState] = useAtom(sidebarStateAtom); // atom 사용

    // 페이지 생성 및 Supabase 연동
    const onCreate = async () => {
        // Supabase 데이터베이스 row 생성
        const { error, status } = await supabase
            .from("todos")
            .insert([{ title: "", start_date: new Date(), end_date: new Date(), contents: [] }])
            .select();

        if (error) {
            console.log(error);
        }
        if (status === 201) {
            toast({
                title: "생성 완료!",
                description: "새로운 투두리스트가 생성 되었습니다.",
            });

            // 방금 생성한 TO DO LIST의 ID 값으로 URL 파라미터 생성
            let { data } = await supabase.from("todos").select();
            if (data) router.push(`/create/${data[data?.length - 1].id}`);
            getTodos();
        }
    };

    // Supabase에 기존에 생성된 페이지가 있는지 없는지 확인
    const getTodos = async () => {
        let { data: todos, error } = await supabase.from("todos").select("*");
        setTodos(todos);

        return todos;
    };

    useEffect(() => {
        getTodos();
    }, [sidebarState]);

    return (
        <div className={styles.container}>
            {/* 검색창 */}
            <div className={styles.container__searchBox}>
                <SearchBar placeholder="검색어를 입력하세요." />
            </div>
            <div className={styles.container__buttonBox}>
                <Button variant={"outline"} className="w-full text-orange-500 border-orange-400 hover:bg-orange-50 hover:text-orange-500" onClick={onCreate}>
                    Add New Page
                </Button>
            </div>
            <div className={styles.container__todos}>
                <span className={styles.container__todos__label}>Your To do</span>
                {/* Is Supabase Todos */}
                <div className={styles.container__todos__list}>
                    {todos &&
                        todos.map((item: any) => {
                            return (
                                <div className="flex items-center py-2 bg-[#f5f5f4] rounded-sm cursor-pointer" key={item.id}>
                                    <Dot className="mr-1 text-green-400" />
                                    <span className="text-sm">{item.title === "" ? "제목 없음" : item.title}</span>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

export default SideNavigation;
