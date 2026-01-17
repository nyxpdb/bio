// ═══════════════════════════════════════════
// PROFILE UPDATE & RENDERING
// ═══════════════════════════════════════════

let spotifyInterval = null;
let currentSpotifyData = null;

function updateProfile(data) {
    // Validar se os dados estão completos
    if (!data || !data.discord_user) {
        console.error('❌ Dados inválidos recebidos do Lanyard:', data);
        showError();
        return;
    }

    const user = data.discord_user;
    const status = data.discord_status;
    const activities = data.activities || [];
    const spotify = data.spotify;
    const kv = data.kv || {};

    // Hide skeleton, show content
    const skeletonLoader = document.getElementById('skeletonLoader');
    const profileContent = document.getElementById('profileContent');
    skeletonLoader.classList.add('hidden');
    profileContent.classList.remove('hidden');

    // Avatar
    const avatarHash = user.avatar;
    const avatarUrl = avatarHash
        ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.${avatarHash.startsWith('a_') ? 'gif' : 'webp'}?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> 22n) % 6n}.png`;
    document.getElementById('avatarImage').src = avatarUrl;

    // Avatar Decoration
    if (user.avatar_decoration_data) {
        const decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=160`;
        document.getElementById('avatarDecoration').innerHTML = `<img src="${decorationUrl}" alt="Decoration">`;
    }

    // Banner
    const bannerElement = document.getElementById('bannerImage');
    if (user.banner) {
        const bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'webp'}?size=600`;
        bannerElement.src = bannerUrl;
        bannerElement.style.display = 'block';
    } else if (user.banner_color) {
        bannerElement.style.display = 'none';
        document.getElementById('profileBanner').style.background = user.banner_color;
    }

    // Status
    document.getElementById('statusIndicator').className = `status-indicator ${status}`;

    // Username
    document.getElementById('displayName').textContent = user.global_name || user.username;
    document.getElementById('username').textContent = `@${user.username}`;

    // Custom Status
    const customActivity = activities.find(a => a.type === 4);
    const customStatusEl = document.getElementById('customStatus');
    if (customActivity && (customActivity.state || customActivity.emoji)) {
        customStatusEl.classList.remove('hidden');
        const emojiEl = document.getElementById('customStatusEmoji');

        if (customActivity.emoji) {
            if (customActivity.emoji.id) {
                emojiEl.src = `https://cdn.discordapp.com/emojis/${customActivity.emoji.id}.${customActivity.emoji.animated ? 'gif' : 'webp'}`;
                emojiEl.style.display = 'inline';
            } else {
                emojiEl.style.display = 'none';
            }
        } else {
            emojiEl.style.display = 'none';
        }

        document.getElementById('customStatusText').textContent = customActivity.state || '';
    } else {
        customStatusEl.classList.add('hidden');
    }

    // Badges
    const badgesContainer = document.getElementById('badgesSection');
    badgesContainer.innerHTML = '';
    const flags = user.public_flags || 0;

    // Add flag-based badges
    Object.values(BADGES).forEach(badge => {
        if (flags & badge.flag) {
            addBadge(badgesContainer, badge);
        }
    });

    // Add Nitro badge if animated avatar/banner
    if (avatarHash?.startsWith('a_') || user.banner?.startsWith('a_')) {
        addBadge(badgesContainer, EXTRA_BADGES.NITRO);
    }

    // Bio
    document.getElementById('bioText').innerHTML = kv.bio || 'Sem descrição disponível.';

    // Member Since
    const createdAt = new Date(Number((BigInt(user.id) >> 22n) + 1420070400000n));
    document.getElementById('memberSince').textContent = createdAt.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Activity (Game, etc.)
    const gameActivity = activities.find(a => a.type === 0);
    const activitySection = document.getElementById('activitySection');
    const activityDivider = document.getElementById('activityDivider');

    if (gameActivity) {
        activitySection.classList.remove('hidden');
        activityDivider.classList.remove('hidden');

        document.getElementById('activityTitle').textContent = 'Jogando';
        document.getElementById('activityName').textContent = gameActivity.name;
        document.getElementById('activityDetails').textContent = gameActivity.details || '';
        document.getElementById('activityState').textContent = gameActivity.state || '';

        // Activity images
        if (gameActivity.assets) {
            const largeImage = gameActivity.assets.large_image;
            if (largeImage) {
                let imageUrl;
                if (largeImage.startsWith('mp:external/')) {
                    imageUrl = `https://media.discordapp.net/external/${largeImage.replace('mp:external/', '')}`;
                } else if (largeImage.startsWith('spotify:')) {
                    imageUrl = `https://i.scdn.co/image/${largeImage.replace('spotify:', '')}`;
                } else {
                    imageUrl = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${largeImage}.png`;
                }
                document.getElementById('activityImage').src = imageUrl;
            }

            const smallImage = gameActivity.assets.small_image;
            const smallImageEl = document.getElementById('activitySmallImage');
            if (smallImage) {
                let smallImageUrl;
                if (smallImage.startsWith('mp:external/')) {
                    smallImageUrl = `https://media.discordapp.net/external/${smallImage.replace('mp:external/', '')}`;
                } else {
                    smallImageUrl = `https://cdn.discordapp.com/app-assets/${gameActivity.application_id}/${smallImage}.png`;
                }
                smallImageEl.src = smallImageUrl;
                smallImageEl.classList.remove('hidden');
            } else {
                smallImageEl.classList.add('hidden');
            }
        }

        // Elapsed time
        if (gameActivity.timestamps?.start) {
            const elapsed = formatElapsedTime(gameActivity.timestamps.start);
            document.getElementById('activityTime').textContent = `${elapsed} jogando`;
        } else {
            document.getElementById('activityTime').textContent = '';
        }
    } else {
        activitySection.classList.add('hidden');
        activityDivider.classList.add('hidden');
    }

    // Spotify
    const spotifySection = document.getElementById('spotifySection');
    const spotifyDivider = document.getElementById('spotifyDivider');

    if (spotify) {
        currentSpotifyData = spotify;
        spotifySection.classList.remove('hidden');
        spotifyDivider.classList.remove('hidden');

        document.getElementById('spotifySong').textContent = spotify.song;
        document.getElementById('spotifyArtist').textContent = `por ${spotify.artist}`;
        document.getElementById('spotifyAlbum').textContent = `em ${spotify.album}`;
        document.getElementById('spotifyAlbumArt').src = spotify.album_art_url;

        document.getElementById('spotifyTotalTime').textContent = formatTime(spotify.timestamps.end - spotify.timestamps.start);

        // Start progress update
        if (spotifyInterval) clearInterval(spotifyInterval);
        updateSpotifyProgress();
        spotifyInterval = setInterval(updateSpotifyProgress, 1000);
    } else {
        currentSpotifyData = null;
        spotifySection.classList.add('hidden');
        spotifyDivider.classList.add('hidden');
        if (spotifyInterval) {
            clearInterval(spotifyInterval);
            spotifyInterval = null;
        }
    }
}

function addBadge(container, badge) {
    const wrapper = document.createElement('div');
    wrapper.className = 'badge-wrapper';
    wrapper.innerHTML = `
        <img class="badge" src="${badge.icon}" alt="${badge.name}">
        <span class="badge-tooltip">${badge.name}</span>
    `;
    container.appendChild(wrapper);
}

function updateSpotifyProgress() {
    if (!currentSpotifyData) return;

    const now = Date.now();
    const { start, end } = currentSpotifyData.timestamps;
    const elapsed = now - start;
    const total = end - start;
    const progress = Math.min((elapsed / total) * 100, 100);

    document.getElementById('spotifyProgress').style.width = `${progress}%`;
    document.getElementById('spotifyCurrentTime').textContent = formatTime(elapsed);
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatElapsedTime(startTimestamp) {
    const elapsed = Date.now() - startTimestamp;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Handle visibility change to pause/resume Spotify updates
document.addEventListener('visibilitychange', () => {
    if (document.hidden && spotifyInterval) {
        clearInterval(spotifyInterval);
        spotifyInterval = null;
    } else if (!document.hidden && currentSpotifyData) {
        updateSpotifyProgress();
        spotifyInterval = setInterval(updateSpotifyProgress, 1000);
    }
});
