import DropdownButton from "../objects/DropdownButton";

const options = {
    "names": "Icons with Names",
    "icons": "Icons Only",
    "stats": "Stats",
    "types": "Skill Types",
    "calc": "Clash/Damage Calc",
    "s1": "Skill 1",
    "s2": "Skill 2",
    "s3": "Skill 3",
    "def": "Defense",
    "skills": "All Skills",
    "passives1": "Combat Passives",
    "passives2": "Support Passives",
    "ego1": "Zayin Details",
    "ego2": "Teth Details",
    "ego3": "He Details",
    "ego4": "Waw Details",
    "ego5": "Aleph Details",
    "egoa": "E.G.O Awakenings",
    "egob": "E.G.O Corrosions",
    "egopassives": "E.G.O Passives",
    "egocosts": "E.G.O Costs",
    "egoresists": "E.G.O Resists"
};

const optionsWithEdit = {
    "edit": "Editing",
    ...options
}

export default function DisplayTypeButton({ value, setValue, includeEdit = false }) {
    return <DropdownButton value={value} setValue={setValue} left={false} options={includeEdit ? optionsWithEdit : options} />
}