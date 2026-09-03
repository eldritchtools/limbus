"use client";

import { useEffect, useRef, useState } from "react";

import FinishedScreen from "./FinishedScreen";
import { constructVoicelineQuizGenerator } from "./generator";
import GuessingScreen from "./GuessingScreen";
import RevealScreen from "./RevealScreen";
import { dailySettings, defaultSettings } from "./settings";
import SetupScreen from "./SetupScreen";
import { useData } from "../components/DataProvider";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { useQuiz } from "../components/quiz/useQuiz";
import { useRealtime } from "../components/realtime/RealtimeProvider";
import useRealtimeClientId from "../components/realtime/useRealtimeClientId";
import { useSiteCustomization } from "../components/SiteCustomizationProvider";
import { useAuth } from "../database/authProvider";
import { getLocalStore } from "../database/localDB";
import { triggerGameCompleteGAEvent, triggerGameStartGAEvent } from "../lib/gaEvents";
import useLocalState from "../lib/useLocalState";

const GUESSER_ID = "voiceline";

function Guesser({ mode, setMode, settings, setSettings, quiz, egos, egoVoicelines }) {
    if (quiz.phase === "setup") {
        if (mode === "standard") {
            const handleSetSettings = async (valueOrFn) => {
                const newSettings = typeof valueOrFn === "function" ? valueOrFn(settings) : valueOrFn;
                await getLocalStore("guessers").save({ id: GUESSER_ID, ...newSettings });
                setSettings(newSettings);
            }

            return <SetupScreen
                mode={mode}
                settings={settings}
                setSettings={handleSetSettings}
                onStart={() => {
                    quiz.registerGenerator(constructVoicelineQuizGenerator(settings, egoVoicelines))
                    quiz.start(settings)
                }}
                onReset={() => handleSetSettings(defaultSettings)}
            />
        } else
            return <LoadingContentPageTemplate />
    }

    if (quiz.phase === "loading")
        return <LoadingContentPageTemplate />

    if (quiz.phase === "guessing")
        return <GuessingScreen
            mode={mode} settings={settings} quiz={quiz}
            submitAnswer={quiz.submitGuess} skip={quiz.skip}
            egos={egos}
        />

    if (quiz.phase === "reveal")
        return <RevealScreen
            mode={mode} settings={settings} quiz={quiz} next={quiz.next} egos={egos}
        />

    if (quiz.phase === "finished")
        return <FinishedScreen
            mode={mode} setMode={setMode} settings={settings} quiz={quiz} egos={egos}
        />
}


function MultiplayerGuesser({ mode, setMode, settings, setSettings, quiz, egos, egoVoicelines }) {
    const [roomId, setRoomId] = useState(null);
    const roomIdRef = useRef(null);
    const { profile } = useAuth();
    const { getCustomizationValue, setCustomizationValue } = useSiteCustomization();
    const [displayName, setDisplayName] = useLocalState("chatDisplayName", profile?.username ?? "Guest");
    const { room, quiz: realtimeQuiz } = useRealtime();
    const [roomInput, setRoomInput] = useState("");
    const [joinMessage, setJoinMessage] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [correctParticipants, setCorrectParticipants] = useState(null);
    const [scoreboard, setScoreboard] = useState(null);
    const [countStr, setCountStr] = useState("");
    const clientId = useRealtimeClientId();
    const participantCountRef = useRef(0);

    const joinRoom = async isHost => {
        const roomCode = `quiz:${isHost ? "new" : roomInput}`;

        try {
            let roomObj = await room.join(roomCode, {
                nameFn: id => `Voiceline Guesser ${id}`,
                autoJoinChat: getCustomizationValue("autoConnectChat"),
                displayName: displayName
            });

            await realtimeQuiz.mount(roomObj.id, {
                displayName,
                clientId,
                settings: isHost ? settings : null,
                handlers: {
                    connected: () => {
                        setRoomId(roomObj.id);
                        roomIdRef.current = roomObj.id;
                        setIsHost(isHost);
                    },

                    disconnected: () => {
                        setRoomId(null);
                        roomIdRef.current = null;
                        setIsHost(false);
                        room.leave(roomObj.id);
                    },

                    state: payload => {
                        if (payload.settings) setSettings(payload.settings);
                        if (payload.is_host) setIsHost(payload.is_host);
                        if (payload.is_host && payload.settings)
                            quiz.registerGenerator(constructVoicelineQuizGenerator(settings, egoVoicelines));

                        if (payload.participants) setParticipants(payload.participants);
                        if (payload.participant_count) {
                            setCountStr(`${payload.answer_count}/${payload.participant_count}`);
                            participantCountRef.current = payload.participant_count;
                        }
                        if (payload.correct_participants) setCorrectParticipants(payload.correct_participants);
                        if (payload.scoreboard) setScoreboard(payload.scoreboard);

                        const quizFields = {};
                        if (payload.phase) quizFields.phase = payload.phase;
                        if (payload.current_question) quizFields.problem = payload.current_question;
                        if (payload.current_answer) quizFields.currentAnswer = payload.current_answer;
                        if (payload.question_number) quizFields.round = payload.question_number - 1;
                        if ("score" in payload) quizFields.score = payload.score;
                        if (payload.submission) quizFields.answers = [payload.submission];

                        if (Object.keys(quizFields).length > 0) quiz.setFields(quizFields);
                    },

                    joined: ({ display_name }) => {
                        setParticipants(p => ([...p, display_name]));
                        participantCountRef.current = participantCountRef.current + 1;
                    },

                    left: ({ display_name }) => {
                        setParticipants(p => {
                            const index = p.indexOf(display_name);
                            if (index !== -1) return [...p].toSpliced(index, 1);
                            else return p;
                        })
                        participantCountRef.current = participantCountRef.current - 1;
                    },

                    settings: ({ settings }) => {
                        setSettings(settings);
                    },

                    question: ({ current_question, question_number }) => {
                        quiz.setFields({
                            phase: "guessing",
                            problem: current_question,
                            round: question_number - 1,
                            answers: [],
                        });

                        setCountStr(`0/${participantCountRef.current}`);
                    },

                    answer_count: ({ answer_count, participant_count }) => {
                        setCountStr(`${answer_count}/${participant_count}`);
                        participantCountRef.current = participant_count;
                    },

                    submission: ({ submission }) => {
                        quiz.setFields({ answers: [submission] });
                    }
                }
            });
        } catch (err) {
            if (isHost) setJoinMessage("Unable to create room.");
            else setJoinMessage("Unable to join room.")
        }
    }

    useEffect(() => {
        return () => {
            if (roomIdRef.current) room.leave(roomIdRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!roomId) {
        return <>
            <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Voiceline Guesser</h1>
            <h2>Join Settings</h2>

            <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ textAlign: "end" }}>Display Name:</span>
                <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Display name"
                />
                <span style={{ textAlign: "end" }}>Room Code:</span>
                <input
                    value={roomInput}
                    onChange={e => setRoomInput(e.target.value)}
                />
            </div>
            <span className="sub-text">Code used to join a hosted room. Ignored when hosting a new room.</span>

            <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <input type="checkbox"
                    checked={getCustomizationValue("autoConnectChat")}
                    onChange={e => setCustomizationValue("autoConnectChat", e.target.checked)}
                />
                <span>Automatically join chat room</span>
            </label>

            <h2>Choose an option</h2>
            <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => joinRoom(true)}>Host Room</span>
            <span className="sub-text">Host a room. Hosts choose the guesser&apos;s settings and decide when to move to the next round.</span>
            <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => joinRoom(false)}>Join Room</span>
            <span className="sub-text">Join a room hosted by someone else.</span>
            {joinMessage && <span>{joinMessage}</span>}
        </>
    }

    if (quiz.phase === "setup")
        return <SetupScreen
            mode={mode} settings={settings}
            setSettings={async valueOrFn => {
                if (!isHost) return;
                const newSettings = typeof valueOrFn === "function" ? valueOrFn(settings) : valueOrFn;
                await getLocalStore("guessers").save({ id: GUESSER_ID, ...newSettings });
                realtimeQuiz.changeSettings(roomId, newSettings);
            }}
            leaveRoom={() => {
                if (roomIdRef.current) {
                    room.leave(roomIdRef.current);
                    roomIdRef.current = null;
                    setRoomId(null);
                }
            }}
            onStart={async () => {
                if (isHost) {
                    triggerGameStartGAEvent(GUESSER_ID, mode);
                    quiz.registerGenerator(constructVoicelineQuizGenerator({...settings, rounds: 1}, egoVoicelines));
                    const problem = await quiz.generateProblem();
                    realtimeQuiz.startGame(roomId, problem, problem.answer);
                }
            }}
            onReset={async () => {
                if (!isHost) return;
                const newSettings = defaultSettings
                await getLocalStore("guessers").save({ id: GUESSER_ID, ...newSettings });
                realtimeQuiz.changeSettings(roomId, newSettings);
            }}
            isHost={isHost} roomId={roomId} participants={participants}
        />

    if (quiz.phase === "guessing")
        return <GuessingScreen
            mode={mode} settings={settings} quiz={quiz}
            submitAnswer={answer => {
                quiz.setFields([answer]);
                realtimeQuiz.submitAnswer(roomId, answer);
            }}
            endRound={() => {
                if (isHost) realtimeQuiz.endRound(roomId);
            }}
            egos={egos}
            isHost={isHost}
            countStr={countStr}
        />

    if (quiz.phase === "reveal")
        return <RevealScreen
            mode={mode} settings={settings} quiz={quiz} egos={egos}
            next={async () => {
                const problem = await quiz.generateProblem();
                if (isHost) realtimeQuiz.nextRound(roomId, problem, problem.answer);
            }}
            endGame={() => {
                if (isHost) {
                    triggerGameCompleteGAEvent(GUESSER_ID, mode);
                    realtimeQuiz.endGame(roomId);
                }
            }}
            isHost={isHost}
            correctParticipants={correctParticipants}
            scoreboard={scoreboard}
        />

    if (quiz.phase === "finished")
        return <FinishedScreen
            mode={mode} setMode={setMode} settings={settings} quiz={quiz} egos={egos}
            isHost={isHost}
            returnToSetup={() => {
                if (isHost) realtimeQuiz.returnToSetup(roomId);
            }}
            scoreboard={scoreboard}
        />


    return <Guesser
        mode={mode} setMode={setMode}
        settings={settings} setSettings={setSettings}
        quiz={quiz} egos={egos}
        roomId={roomId} isHost={isHost}
        realtimeQuiz={realtimeQuiz} participants={participants} countStr={countStr}
        correctParticipants={correctParticipants} scoreboard={scoreboard}
    />
}

export default function VoicelineGuesserPage() {
    const [mode, setMode] = useState(null);
    const [egos, egosLoading] = useData("egos_mini");
    const [egoVoicelines, egoVoicelinesLoading] = useData("ego_voicelines");
    const [settings, setSettings] = useState(null);
    const quiz = useQuiz(GUESSER_ID);
    const loading = egosLoading || egoVoicelinesLoading;

    const handleSetMode = async mode => {
        if (mode === "standard" || mode === "multi") {
            const saved = await getLocalStore("guessers").get(GUESSER_ID);
            if (saved) setSettings(saved);
            else setSettings(defaultSettings);
            quiz.returnToSetup();
        } else if (mode === "daily") {
            quiz.registerGenerator(constructVoicelineQuizGenerator(dailySettings, egoVoicelines));
            quiz.start(dailySettings);
        }
        setMode(mode);
    }

    if (!mode)
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "1000px", gap: "0.5rem" }}>
                <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Voiceline Guesser</h1>
                <span style={{ maxWidth: "1000px", textAlign: "center", marginBottom: "1rem" }}>
                    Guess the E.G.O the voiceline belongs to.
                    <br /> <br />
                    You will hear a clipped segment of one of the voicelines of a random E.G.O. Clips may come from the awakening or corrosion versions, and from any version for base E.G.Os. Try your best to guess which E.G.O it belongs to.
                    <br /> <br />
                    Choose a mode to begin.
                </span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => handleSetMode("standard")} disabled={loading}>Standard</span>
                <span className="sub-text">Standard mode lets you guess against a specified number of rounds with customizable settings.</span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => handleSetMode("daily")} disabled={loading}>Daily</span>
                <span className="sub-text">Daily mode gives everyone the same problem each day (Reset at 6AM KST). Fixed at normal difficulty and 3 chances.</span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => handleSetMode("multi")} disabled={loading}>Multiplayer</span>
                <span className="sub-text">Play against others to see who can get the highest score. May occasionally be interrupted by server updates.</span>
            </div>
        </div>;

    if (mode === "multi") {
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
            <MultiplayerGuesser
                mode={mode} setMode={setMode}
                settings={settings} setSettings={setSettings}
                quiz={quiz} egos={egos} egoVoicelines={egoVoicelines}
            />
        </div>
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <Guesser
            mode={mode} setMode={setMode}
            settings={settings} setSettings={setSettings}
            quiz={quiz} egos={egos} egoVoicelines={egoVoicelines}
        />
    </div>
}

