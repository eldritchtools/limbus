// disabled cache for now

export async function invalidateBuild(id) {
    return null;
    // await fetch("/api/builds/invalidate", {
    //     method: "POST",
    //     body: JSON.stringify({ id: id }),
    //     headers: {
    //         "Content-Type": "application/json"
    //     }
    // });
}

export async function invalidateMdPlan(id) {
    return null;
    // await fetch("/api/md-plans/invalidate", {
    //     method: "POST",
    //     body: JSON.stringify({ id: id }),
    //     headers: {
    //         "Content-Type": "application/json"
    //     }
    // });
}