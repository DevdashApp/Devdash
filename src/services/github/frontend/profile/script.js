async function loadProfile(username) {
    const profileResponse = await fetch('/api/github/profile/get?username=' + username);

    const profileData = await profileResponse.json();

    const profilePicture = profileData.avatar_url;
    const displayName = profileData.name;
    const bio = profileData.bio;

    console.log(profileData);

    document.getElementById('bio').textContent = bio;
    document.getElementById('username').textContent = profileData.login;
    document.getElementById('displayName').textContent = displayName;
    document.getElementById('profilePicture').setAttribute('src', profilePicture);
}

loadProfile(window.location.pathname.split('/')[3]);