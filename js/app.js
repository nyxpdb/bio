const { createApp, ref } = Vue;

createApp({
    setup() {
        const profiles = ref([]);
        const isLoaded = ref(false);

        function getStatusClass(status) {
            switch (status) {
                case 'online': return 'status-online';
                case 'idle': return 'status-idle';
                case 'dnd': return 'status-dnd';
                default: return 'status-offline';
            }
        }

        function getStatusText(status) {
            switch (status) {
                case 'online': return 'Online';
                case 'idle': return 'Away';
                case 'dnd': return 'Do Not Disturb';
                default: return 'Offline';
            }
        }

        async function fetchProfiles() {
            try {
                console.log('[Profiles] Fetching data for IDs:', IDS);

                const initialProfiles = IDS.map((id, idx) => ({
                    id,
                    username: '',
                    discriminator: '',
                    display_name: '',
                    avatar: '',
                    discordBadges: [],
                    statusClass: '',
                    statusText: '',
                    activity: '',
                    socials: SOCIALS[idx] || {}
                }));

                profiles.value = initialProfiles;
                console.log('[Profiles] Initialized:', initialProfiles.length, 'profiles');

                const fetchPromises = IDS.map(async (id, idx) => {
                    try {
                        console.log(`[Profile ${idx + 1}/${IDS.length}] Fetching user ${id}`);
                        const res = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
                        const data = await res.json();

                        if (data.success) {
                            const user = data.data.discord_user;
                            console.log(`[Profile ${idx + 1}] Loaded:`, user.username);
                            console.log(`[Profile ${idx + 1}] Discord flags:`, user.public_flags_array);

                            const discordBadges = (user.public_flags_array || [])
                                .map(flag => ({
                                    icon: BADGE_MAP[flag],
                                    name: flag.replace(/_/g, ' ')
                                }))
                                .filter(badge => badge.icon);

                            console.log(`[Profile ${idx + 1}] Official badges:`, discordBadges.length);

                            const customBadges = CUSTOM_BADGES[id] || [];
                            console.log(`[Profile ${idx + 1}] Custom badges:`, customBadges.length);

                            const allBadges = [...discordBadges, ...customBadges];

                            const avatar = user.avatar
                                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
                                : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;

                            const status = data.data.discord_status;
                            let spotify = null;

                            if (data.data.spotify) {
                                spotify = {
                                    song: data.data.spotify.song,
                                    artist: data.data.spotify.artist,
                                    album: data.data.spotify.album,
                                    albumArt: data.data.spotify.album_art_url
                                };
                                console.log(`[Profile ${idx + 1}] Spotify:`, spotify.song, 'by', spotify.artist);
                            }

                            profiles.value[idx] = {
                                ...profiles.value[idx],
                                username: user.username,
                                display_name: user.display_name || user.username,
                                discriminator: user.discriminator,
                                avatar,
                                discordBadges: allBadges,
                                statusClass: getStatusClass(status),
                                statusText: getStatusText(status),
                                spotify,
                                socials: SOCIALS[idx] || {}
                            };
                        } else {
                            console.warn(`[Profile ${idx + 1}] Not found in Lanyard - skipping`);
                        }
                    } catch (e) {
                        console.error(`[Profile ${idx + 1}] Error:`, e);
                    }
                });

                // Minimum 2 second delay
                const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));

                await Promise.all([Promise.all(fetchPromises), delayPromise]);

                profiles.value = profiles.value.filter(p => p.username !== '');
                console.log('[Profiles] Loaded successfully:', profiles.value.length, 'profiles');
                isLoaded.value = true;

                setTimeout(() => {
                    const cards = document.querySelectorAll('.profile-card');
                    console.log('[VanillaTilt] Initializing on', cards.length, 'cards');
                    cards.forEach(card => {
                        VanillaTilt.init(card, {
                            max: 10,
                            speed: 400,
                            perspective: 1200,
                            scale: 1.03,
                            glare: false
                        });
                    });
                }, 100);
            } catch (e) {
                console.error('[Profiles] Initialization error:', e);
            }
        }

        fetchProfiles();

        return {
            profiles,
            isLoaded
        };
    }
}).mount('#app');
