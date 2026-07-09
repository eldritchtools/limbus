import { generateArtworkQuiz } from "@/app/artwork-guesser/generator";
import { dailySettings as artworkDailySettings } from "@/app/artwork-guesser/settings";
import { getDailyQuiz, saveDailyQuiz } from "@/app/database/dailyQuizzes";
// import { DATA_ROOT } from "@/app/paths";
import { generateVoicelineQuiz } from "@/app/voiceline-guesser/generator";
import { dailySettings as voicelineDailySettings } from "@/app/voiceline-guesser/settings";

const DATA_ROOT = "https://pub-caa4ae10616949bb9dfc2a70efc46e82.r2.dev";

function getToday() {
    const base = new Date();
    base.setUTCDate(base.getUTCDate());

    const SHIFT = 3 * 60 * 60 * 1000; // 6am at UTC+9 = +9-6

    const date = new Date(base.getTime() + SHIFT);

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function fetchDataFile(path) {
    // const res = await fetch(`${DATA_ROOT}/${path}.json`);
    // return res.json();

    const url = `${DATA_ROOT}/${path}.json`;

    const res = await fetch(url);

    const text = await res.text();

    return {
        url,
        status: res.status,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries()),
        text,
    };
}

export async function GET(request, { params }) {
    const { id } = await params;
    const today = getToday();

    let quiz = await getDailyQuiz(id, today);

    if (!quiz) {
        if (id === "artwork") {
            const data = await fetchDataFile("identities_mini");
            return Response.json(data);

            quiz = generateArtworkQuiz(data, artworkDailySettings);
        } else if (id === "voiceline") {
            const data = await fetchDataFile("ego_voicelines");
            quiz = generateVoicelineQuiz(data, voicelineDailySettings);
        }

        if (!quiz) {
            return Response.json(
                { error: "Unknown quiz." },
                { status: 404 }
            );
        }

        try {
            await saveDailyQuiz(id, today, quiz);
        } catch (e) {
            // duplicate
            if (e.code === "23505") {
                quiz = await getDailyQuiz(id, today);
            } else {
                throw e;
            }
        }
    }

    return Response.json({...quiz, date: today});
}