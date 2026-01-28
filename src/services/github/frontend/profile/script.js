async function loadProfile(username) {
    const profileResponse = await fetch('/api/github/profile/get?username=' + username);

    const profileData = await profileResponse.json();

    const profilePicture = profileData.avatar_url;
    const displayName = profileData.name;
    const bio = profileData.bio;

    console.log(profileData);

    document.getElementById('bio').textContent = bio;
    document.getElementById('username').textContent = `${profileData.login} · ${profileData.pronouns}`;
    document.getElementById('displayName').textContent = displayName;
    document.getElementById('profilePicture').setAttribute('src', profilePicture);
    document.getElementById('followers').textContent = profileData.followers;
    document.getElementById('following').textContent = profileData.following;
    if (profileData.location) document.getElementById('location').textContent = profileData.location;
    if (profileData.timezone) {
        const date = new Date();
        const time = new Intl.DateTimeFormat(undefined, { timeZone: profileData.timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
        const offset = new Intl.DateTimeFormat('en-US', { timeZone: profileData.timezone, timeZoneName: 'shortOffset' }).formatToParts(date).find(p => p.type === 'timeZoneName').value.replace('GMT', 'UTC');
        document.getElementById('timezone').textContent = `${time} (${offset})`;
    }
}

loadProfile(window.location.pathname.split('/')[3]);
