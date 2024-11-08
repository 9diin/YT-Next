"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { nanoid } from "nanoid";
// COMPONENTS
import LabelCalendar from "@/components/common/calendar/LabelCalendar";
import BasicBoard from "@/components/common/board/BasicBoard";
// Shadcn UI
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft } from "lucide-react";
// CSS
import styles from "./page.module.scss";

interface Todo {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    contents: BoardContent[];
}
interface BoardContent {
    boardId: string | number;
    isCompleted: boolean;
    title: string;
    startDate: string;
    endDate: string;
    content: string;
}

function Page() {
    const router = useRouter();
    const pathname = usePathname();
    const [title, setTitle] = useState<string>(""); // 초기 title을 빈 문자열로 설정
    const [boards, setBoards] = useState<Todo | null>(null); // boards의 초기값을 null로 설정
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const { toast } = useToast();

    const insertRowData = async (contents: BoardContent[]) => {
        // Supabase 데이터베이스에 연동
        const { data, error, status } = await supabase.from("todos").update({ contents: contents }).eq("id", pathname.split("/")[2]);

        if (error) {
            console.log(error);
            toast({
                title: "에러가 발생했습니다.",
                description: "콘솔 창에 출력된 에러를 확인하세요.",
            });
        }
        if (status === 204) {
            toast({
                title: "추가 완료!",
                description: "새로운 TO DO BOARD가 추가 되었습니다.",
            });
            getData();
        }
    };

    const createBoard = () => {
        let newContents: BoardContent[] = [];
        const boardContent = {
            boardId: nanoid(),
            isCompleted: false,
            title: "",
            startDate: "",
            endDate: "",
            content: "",
        };

        if (boards && boards.contents.length > 0) {
            newContents = [...boards.contents];
            newContents.push(boardContent);
            insertRowData(newContents);
        } else if (boards && boards.contents.length === 0) {
            newContents.push(boardContent);
            insertRowData(newContents);
        }
    };

    // Supabase에 기존에 생성된 페이지가 있는지 없는지 확인
    const getData = async () => {
        let { data: todos, error } = await supabase.from("todos").select("*");

        if (todos !== null) {
            todos.forEach((item: Todo) => {
                if (item.id === Number(pathname.split("/")[2])) {
                    setBoards(item);
                    setTitle(item.title); // boards를 가져온 후 title을 갱신
                }
            });
        }
    };

    const onSave = async () => {
        const { data, error, status } = await supabase
            .from("todos")
            .update({
                title: title,
            })
            .eq("id", pathname.split("/")[2]);

        if (error) {
            console.log(error);
            toast({
                title: "에러가 발생했습니다.",
                description: "콘솔 창에 출력된 에러를 확인하세요.",
            });
        }
        if (status === 204) {
            toast({
                title: "수정 완료!",
                description: "작성한 글이 Supabase에 올바르게 저장되었습니다.",
            });
            getData();
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className={styles.container}>
            <div className="absolute top-6 left-7 flex items-center gap-2">
                <Button variant={"outline"} size={"icon"} onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <Button variant={"outline"} onClick={onSave}>
                    저장
                </Button>
            </div>
            <header className={styles.container__header}>
                <div className={styles.container__header__contents}>
                    <input
                        type="text"
                        placeholder="Enter Title Here"
                        className={styles.input}
                        onChange={(event) => setTitle(event.target.value)} // title 상태 갱신
                        value={title} // title을 상태에서 직접 가져오기
                    />
                    <div className={styles.progressBar}>
                        <span className={styles.progressBar__status}>0/10 completed</span>
                        {/* 프로그레스 바 UI */}

                        <Progress value={33} className="w-[30%] h-2" indicatorColor="bg-green-500" />
                    </div>
                    <div className={styles.calendarBox}>
                        <div className={styles.calendarBox__calendar}>
                            {/* 캘린더 UI */}

                            <LabelCalendar label="From" handleDate={setStartDate} />
                            <LabelCalendar label="To" handleDate={setEndDate} />
                        </div>
                        <Button variant={"outline"} className="w-[15%] border-orange-500 bg-orange-400 text-white hover:bg-orange-400 hover:text-white" onClick={createBoard}>
                            Add New Board
                        </Button>
                    </div>
                </div>
            </header>
            <main className={styles.container__body}>
                {boards?.contents.length === 0 ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <div className={styles.container__body__infoBox}>
                            <span className={styles.title}>There is no board yet.</span>
                            <span className={styles.subTitle}>Click the button and start flashing!</span>
                            <button className={styles.button} onClick={createBoard}>
                                <Image src="/assets/images/round-button.svg" alt="round-button" width={100} height={100} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-start w-full h-full gap-4 overflow-y-scroll">
                        {boards?.contents.map((board: BoardContent) => {
                            return <BasicBoard key={board.boardId} data={board} handleBoards={setBoards} />;
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Page;
