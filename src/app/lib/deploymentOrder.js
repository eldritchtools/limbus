export function getDeploymentPosition(order, activeSinners, sinnerId) {
    const index = order.findIndex(x => x === sinnerId);
    if (index === -1) {
        return ["none", -1];
    } else if (index < activeSinners) {
        return ["active", index + 1];
    } else {
        return ["backup", index + 1];
    }
}
