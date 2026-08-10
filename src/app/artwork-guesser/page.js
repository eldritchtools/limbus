"use client";

import { useEffect, useRef, useState } from "react";

import FinishedScreen from "./FinishedScreen";
import { constructArtworkQuizGenerator } from "./generator";
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
import useLocalState from "../lib/useLocalState";

const GUESSER_ID = "artwork";

function Guesser({ mode, setMode, settings, setSettings, identities, quiz }) {
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
                    quiz.registerGenerator(constructArtworkQuizGenerator(settings, identities))
                    quiz.start(settings);
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
            identities={identities}
        />

    if (quiz.phase === "reveal")
        return <RevealScreen
            mode={mode} settings={settings} quiz={quiz} next={quiz.next} identities={identities}
        />

    if (quiz.phase === "finished")
        return <FinishedScreen
            mode={mode} setMode={setMode} settings={settings} quiz={quiz} identities={identities}
        />
}

function MultiplayerGuesser({ mode, setMode, settings, setSettings, quiz, identities }) {
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
                nameFn: id => `Artwork Guesser ${id}`,
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
                            quiz.registerGenerator(constructArtworkQuizGenerator(settings, identities));

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
            <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Artwork Guesser</h1>
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
            onStart={() => {
                if (isHost) {
                    quiz.registerGenerator(constructArtworkQuizGenerator(settings, identities));
                    const problem = quiz.generateProblem();
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
            identities={identities}
            isHost={isHost}
            countStr={countStr}
        />

    if (quiz.phase === "reveal")
        return <RevealScreen
            mode={mode} settings={settings} quiz={quiz} identities={identities}
            next={() => {
                const problem = quiz.generateProblem();
                if (isHost) realtimeQuiz.nextRound(roomId, problem, problem.answer);
            }}
            endGame={() => {
                if (isHost) realtimeQuiz.endGame(roomId);
            }}
            isHost={isHost}
            correctParticipants={correctParticipants}
            scoreboard={scoreboard}
        />

    if (quiz.phase === "finished")
        return <FinishedScreen
            mode={mode} setMode={setMode} settings={settings} quiz={quiz} identities={identities}
            isHost={isHost}
            returnToSetup={() => {
                if (isHost) realtimeQuiz.returnToSetup(roomId);
            }}
            scoreboard={scoreboard}
        />


    return <Guesser
        mode={mode} setMode={setMode}
        settings={settings} setSettings={setSettings}
        quiz={quiz} identities={identities}
        roomId={roomId} isHost={isHost}
        realtimeQuiz={realtimeQuiz} participants={participants} countStr={countStr}
        correctParticipants={correctParticipants} scoreboard={scoreboard}
    />
}

export default function ArtworkGuesserPage() {
    const [identities, identitiesLoading] = useData("identities_mini");
    const [mode, setMode] = useState(null);
    const quiz = useQuiz(GUESSER_ID);
    const [settings, setSettings] = useState(null);

    const handleSetMode = async mode => {
        if (mode === "standard" || mode === "multi") {
            const saved = await getLocalStore("guessers").get(GUESSER_ID);
            if (saved) setSettings(saved);
            else setSettings(defaultSettings);
            quiz.returnToSetup();
        } else if (mode === "daily") {
            quiz.registerGenerator(constructArtworkQuizGenerator(dailySettings));
            quiz.start(dailySettings);
        }
        setMode(mode);
    }

    if (!mode)
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "1000px", gap: "0.5rem" }}>
                <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Artwork Guesser</h1>
                <span style={{ maxWidth: "1000px", textAlign: "center", marginBottom: "1rem" }}>
                    Guess the identity the artwork belongs to.
                    <br /> <br />
                    You will be shown a cropped section of one of the full artworks of a random identity. Try your best to guess which identity it belongs to.
                    <br /> <br />
                    Choose a mode to begin.
                </span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => handleSetMode("standard")}>Standard</span>
                <span className="sub-text">Standard mode lets you guess against a specified number of rounds with customizable settings.</span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => handleSetMode("daily")}>Daily</span>
                <span className="sub-text">Daily mode gives everyone the same problem each day (Reset at 6AM KST). Fixed at Normal difficulty, 3 chances, and uptie art only.</span>
                <span className="text-link" style={{ fontSize: "1.2rem" }} onClick={() => handleSetMode("multi")}>Multiplayer</span>
                <span className="sub-text">Play against others to see who can get the highest score.</span>
            </div>
        </div>;

    if (identitiesLoading)
        return <LoadingContentPageTemplate />

    if (mode === "multi") {
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
            <MultiplayerGuesser
                mode={mode} setMode={setMode}
                settings={settings} setSettings={setSettings}
                quiz={quiz} identities={identities}
            />
        </div>
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <Guesser
            mode={mode} setMode={setMode}
            settings={settings} setSettings={setSettings}
            quiz={quiz} identities={identities}
        />
    </div>
}