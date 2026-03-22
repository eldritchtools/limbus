function Pip({ filled = true, mul5 = false }) {
    const style = {
        border: "1px yellow solid"
    }

    if (filled) {
        style.backgroundColor = "yellow";
    }

    if (mul5) {
        style.width = "5px";
        style.height = "12px";
    } else {
        style.width = "5px";
        style.height = "8px";
    }

    return <div style={style} />
}

function AtkWeightCore({ min, bonus }) {
    return <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        {Array.from({ length: min }, (_, i) => <Pip key={i} filled={true} mul5={i % 5 === 4} />)}
        {Array.from({ length: bonus }, (_, i) => <Pip key={i + min} filled={false} mul5={(i + min) % 5 === 4} />)}
    </div>
}

function DiffedAtkWeight({ preSkillData, postSkillData }) {
    const preMin = preSkillData.atkWeight;
    const preBonus = "bonuses" in preSkillData ?
        preSkillData.bonuses.filter(bonus => bonus.type === "atkweight").reduce((acc, bonus) => { acc += bonus.value; return acc; }, 0) :
        0;

    const postMin = postSkillData.atkWeight;
    const postBonus = "bonuses" in postSkillData ?
        postSkillData.bonuses.filter(bonus => bonus.type === "atkweight").reduce((acc, bonus) => { acc += bonus.value; return acc; }, 0) :
        0;

    if (preMin === postMin && preBonus === postBonus)
        return <AtkWeightCore min={preMin} bonus={preBonus} />

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "2px" }}>
        <div style={{ backgroundColor: "rgba(248, 81, 73, 0.35)", opacity: 0.7, padding: "2px" }}><AtkWeightCore min={preMin} bonus={preBonus} /></div>
        <div style={{ backgroundColor: "rgba(46, 160, 67, 0.35)", padding: "2px" }}><AtkWeightCore min={postMin} bonus={postBonus} /></div>
    </div>
}

function AtkWeight({ skillData }) {
    const min = skillData.atkWeight;
    const bonus = "bonuses" in skillData ?
        skillData.bonuses.filter(bonus => bonus.type === "atkweight").reduce((acc, bonus) => { acc += bonus.value; return acc; }, 0) :
        0;

    return <AtkWeightCore min={min} bonus={bonus} />
}

export { DiffedAtkWeight, AtkWeight }