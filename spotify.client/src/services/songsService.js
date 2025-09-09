const GITHUB_REPO_URL = 'https://api.github.com/repos/surya50502001/Spotify-/contents';

export const fetchSongsFromGitHub = async () => {
  try {
    const response = await fetch(GITHUB_REPO_URL);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    const songFiles = data.filter(file => 
      file.name.endsWith('.mp3') || 
      file.name.endsWith('.wav') || 
      file.name.endsWith('.m4a')
    );
    
    return songFiles.map((file, index) => ({
      id: `github-${index}`,
      title: file.name.replace(/\.(mp3|wav|m4a)$/i, '').replace(/[-_]/g, ' '),
      artist: 'Unknown Artist',
      album: 'GitHub Collection',
      duration: '3:00',
      url: file.download_url,
      source: 'github'
    }));
  } catch (error) {
    console.error('Error fetching songs from GitHub:', error);
    return [];
  }
};

export const getAllSongs = async () => {
  return await fetchSongsFromGitHub();
};