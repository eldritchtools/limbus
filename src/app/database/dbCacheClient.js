export async function invalidateBuild(id) {
    await fetch("/api/builds/invalidate", {
        method: "POST",
        body: JSON.stringify({ id: id }),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export async function invalidateMdPlan(id) {
    await fetch("/api/md-plans/invalidate", {
        method: "POST",
        body: JSON.stringify({ id: id }),
        headers: {
            "Content-Type": "application/json"
        }
    });
}