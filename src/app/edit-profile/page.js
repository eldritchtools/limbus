"use client";

import { useEffect, useMemo, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import MarkdownEditorWrapper from "../components/markdown/MarkdownEditorWrapper";
import NoPrefetchLink from "../components/NoPrefetchLink";
import DropdownButton from "../components/objects/DropdownButton";
import { SocialIcon, socialsData } from "../components/user/userSocials";
import { useAuth } from "../database/authProvider";
import { updateUser } from "../database/users";

function SocialsComponent({ socials, setSocials }) {
    const swapOrder = (i1, i2) => {
        const arr = [...socials];
        [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
        setSocials(arr)
    }

    const handleChange = (index, value) => {
        setSocials(socials.map((social, i) => index === i ? { ...social, value: value } : social));
    }

    const handleRemove = (index) => {
        setSocials(socials.filter((s, i) => index !== i));
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {socials.map((social, i) =>
            <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <button onClick={() => swapOrder(i, i - 1)} style={{ fontSize: "0.5rem", padding: "1px 3px" }} disabled={i === 0}><FaChevronUp /></button>
                    <button onClick={() => swapOrder(i, i + 1)} style={{ fontSize: "0.5rem", padding: "1px 3px" }} disabled={i === socials.length - 1}><FaChevronDown /></button>
                </div>
                <SocialIcon type={social.type} iconSize={1.5} link={false} />
                <input
                    type="text"
                    value={social.value}
                    onChange={e => handleChange(i, e.target.value)}
                    style={{ borderColor: social.invalid ? "#fe0000" : "#555" }}
                    placeholder={socialsData[social.type].placeholder}
                />
                <button onClick={() => handleRemove(i)} style={{ color: "#FE0000", fontWeight: "bold" }}> ✕ </button>
            </div>
        )}
    </div>
}

export default function EditProfilePage() {
    const { user, profile, loading, updateUsername, refreshProfile } = useAuth();
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(null);
    const [flair, setFlair] = useState("");
    const [socials, setSocials] = useState([]);
    const [description, setDescription] = useState("");
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username);
            setFlair(profile.flair ?? "");
            setDescription(profile.description ?? "");
            setSocials(profile.socials ?? []);
            setProfileLoading(false);
        }
    }, [profile]);

    const socialsOptions = useMemo(() => Object.entries(socialsData).reduce((acc, [k, v]) => { acc[k] = v.label; return acc; }, {}), []);

    if (loading)
        return <div>
            <h2>Loading Profile...</h2>
        </div>;

    const handleUpdateUsername = async () => {
        setUsernameError('');

        if (!username.trim()) {
            setUsernameError('Username cannot be empty.');
            return;
        }

        setUpdating(true);
        const { error: insertError } = await updateUsername(user.id, username);

        if (insertError) {
            setUpdating(false);
            if (insertError.code === '23505') {
                // unique constraint violation
                setUsernameError('That username is already taken.');
            } else {
                setUsernameError(insertError.message);
            }
            return;
        }

        refreshProfile();
        window.location.reload();
    };

    const handleUpdateProfile = async () => {
        setProfileError('');

        if (flair.trim().length > 32) {
            setProfileError('Flair is too long');
            return;
        }

        let socialsValid = true;
        for (let i = 0; i < socials.length; i++) {
            if (!socialsData[socials[i].type].validator.test(socials[i].value)) {
                socialsValid = false;
                setSocials(p => p.map((social, index) => index === i ? { ...social, invalid: true } : social));
            } else {
                if (socials[i].invalid) {
                    const { invalid, ...rest } = socials[i];
                    setSocials(p => p.map((social, index) => index === i ? rest : social));
                }
            }
        }

        if (!socialsValid) {
            setProfileError('Invalid socials');
            return;
        }

        setUpdating(true);
        await updateUser(user.id, flair.trim(), description, socials);
        setUpdating(false);

        refreshProfile();
        window.location.reload();
    };

    const addSocial = (value) => {
        setSocials(p => [...p, { type: value, value: "" }]);
    }

    const headerStyle = { marginTop: "1rem", marginBottom: "0" };
    const subHeaderStyle = { fontSize: "0.8rem", color: "#aaa" };

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {user ?
            (!profileLoading ?
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "1600px" }}>
                    <h2 style={headerStyle}>Details</h2>
                    <div>
                        View your profile <NoPrefetchLink className="text-link" href={`profiles/${profile.username}`}>here</NoPrefetchLink>.
                    </div>
                    <h4 style={headerStyle}>Username</h4>
                    <span style={subHeaderStyle}>Name to display across the site. This must be updated separately from the rest of the profile.</span>
                    <div><input value={username} onChange={e => setUsername(e.target.value)} /></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button onClick={handleUpdateUsername} disabled={updating}>Update Username</button>
                        {usernameError}
                    </div>
                    <h4 style={headerStyle}>Flair</h4>
                    <span style={subHeaderStyle}>Add a flair to display beside or below your username.</span>
                    <div><input value={flair} onChange={e => setFlair(e.target.value)} /></div>
                    <h4 style={headerStyle}>Profile Description</h4>
                    <span style={subHeaderStyle}>The profile description will be displayed whenever someone views your profile.</span>
                    <MarkdownEditorWrapper value={description} onChange={setDescription} placeholder="Write your profile description..." short={true} />
                    <h4 style={headerStyle}>Links & Socials</h4>
                    <span style={subHeaderStyle}>Add links if you want people to find you elsewhere. These will be displayed on your profile and your builds.</span>
                    <DropdownButton setValue={addSocial} defaultDisplay={"+ Add Social"} options={socialsOptions} />
                    <SocialsComponent socials={socials} setSocials={setSocials} />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button onClick={handleUpdateProfile} disabled={updating}>Update Profile</button>
                        {profileError}
                    </div>
                </div> :
                <h2>Profile Loading...</h2>
            ) :
            <h2>Login to edit profile</h2>
        }
    </div>
}
