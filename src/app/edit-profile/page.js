"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import MarkdownEditorWrapper from "../components/markdown/MarkdownEditorWrapper";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { HorizontalDivider } from "../components/objects/Dividers";
import { AvatarUploader } from "../components/socials/AvatarUploader";
import SocialsEditor from "../components/socials/SocialsEditor";
import { socialsData } from "../components/socials/userSocials";
import { useAuth } from "../database/authProvider";
import { getSupabase } from "../database/connection";
import { fetchPatreonAccount, setPatreonDisplayPreference, unlinkPatreonAccount } from "../database/patreon";
import { updateUser, updateUserAvatar } from "../database/users";

export default function EditProfilePage() {
    const { user, profile, loading, updateUsername, refreshProfile } = useAuth();
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(null);
    const [flair, setFlair] = useState("");
    const [socials, setSocials] = useState([]);
    const [description, setDescription] = useState("");
    const [avatarId, setAvatarId] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState("");
    const [patreon, setPatreon] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (profile) {
            setUsername(profile.username);
            setFlair(profile.flair ?? "");
            setDescription(profile.description ?? "");
            setSocials(profile.socials ?? []);
            setAvatarId(profile.avatar_id);
            setProfileLoading(false);

            const fetchPatreon = async () => {
                const patreonData = await fetchPatreonAccount(user.id);
                if (patreonData) setPatreon(patreonData);
            }

            fetchPatreon();
        }
    }, [user, profile]);

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
        const { error: insertError } = await updateUsername(user.id, username.trim());

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
        setUpdating(false);
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
        if (patreon)
            setPatreonDisplayPreference(patreon.display_preference);
        setUpdating(false);
        setMessage("Updated!");

        refreshProfile();
    };

    const handleAvatarUploaded = async (id) => {
        await updateUserAvatar(user.id, id);
        refreshProfile();
        setAvatarId(id);
    }

    const connectPatreon = async () => {
        const { data: { session } } = await getSupabase().auth.getSession();
        if (!session) return;

        const response = await fetch("/api/patreon/connect", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (!response.ok) {
            console.error("Failed to start Patreon connection");
            return;
        }

        const { url } = await response.json();
        window.location.href = url;
    };

    const handleUnlinkPatreonAccount = async () => {
        if (unlinkPatreonAccount()) {
            setPatreon(null);
            return true;
        }
    };

    const headerStyle = { marginTop: "1rem", marginBottom: "0" };

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>Edit Profile</h2>
        {user ?
            (!profileLoading ?
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "1600px" }}>
                    <h2 style={headerStyle}>Details</h2>
                    <div>
                        View your profile <NoPrefetchLink className="text-link" href={`profiles/${profile.username}`}>here</NoPrefetchLink>.
                    </div>
                    <h4 style={headerStyle}>Username</h4>
                    <span className="sub-text">Name to display across the site. This is updated separately from the rest of the profile.</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input value={username} onChange={e => setUsername(e.target.value)} />
                        <button onClick={handleUpdateUsername} disabled={updating}>Update Username</button>
                        {usernameError}
                    </div>
                    <h4 style={headerStyle}>Profile Picture</h4>
                    <span className="sub-text">Picture to display across the site. Uploads are limited to 5MB. This is updated separately from the rest of the profile.</span>
                    <AvatarUploader avatarId={avatarId} onUpdated={handleAvatarUploaded} />
                    <h4 style={headerStyle}>Flair</h4>
                    <span className="sub-text">Add a flair to display beside or below your username.</span>
                    <div><input value={flair} onChange={e => setFlair(e.target.value)} /></div>
                    <h4 style={headerStyle}>Profile Description</h4>
                    <span className="sub-text">The profile description will be displayed whenever someone views your profile.</span>
                    <MarkdownEditorWrapper value={description} onChange={setDescription} placeholder="Write your profile description..." short={true} />
                    <h4 style={headerStyle}>Links & Socials</h4>
                    <span className="sub-text">Add links if you want people to find you elsewhere. These will be displayed on your profile and your builds.</span>
                    <SocialsEditor socials={socials} setSocials={setSocials} />

                    <h4 style={headerStyle}>Support</h4>
                    <span className="sub-text">If you support the site on Patreon, you can link your account to control whether and how your name is shown on the Support page. This is optional. By default, Patreon supporters will be shown on the Support page using their Patreon name. Note that linking your account may discard any unsaved changes on the other fields on this page. Please save any edits you&apos;ve made before then.</span>
                    {patreon ?
                        <div>
                            <div>
                                Patreon connected as {patreon.patreon_name}
                            </div>
                            <span>Display Name: </span>
                            <select
                                value={patreon.display_preference}
                                onChange={e => setPatreon(p => ({ ...p, display_preference: e.target.value }))}
                            >
                                <option value="patreon">Patreon name</option>
                                <option value="username">Account username</option>
                                <option value="hidden">Hidden</option>
                            </select>
                            <div>
                                <button className="text-link" onClick={handleUnlinkPatreonAccount}>
                                    Unlink Patreon
                                </button>
                            </div>
                        </div> :
                        <div>
                            <button className="text-link" onClick={() => connectPatreon()}>
                                Link Patreon
                            </button>
                        </div>
                    }

                    <HorizontalDivider />
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button onClick={handleUpdateProfile} disabled={updating}>Update Profile</button>
                        {profileError}
                        {message}
                    </div>
                </div> :
                <h2>Profile Loading...</h2>
            ) :
            <h2>Login to edit profile</h2>
        }
    </div>
}
