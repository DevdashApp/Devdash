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
}

loadProfile(window.location.pathname.split('/')[3]);
