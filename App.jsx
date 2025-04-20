import { useState, useEffect } from 'react';

// Fixed API URL with explicit port
const API_URL = 'http://localhost:5000/api/posts';

function App() {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      console.log('Fetching posts from:', API_URL);
      const res = await fetch(API_URL);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server response:', errorText);
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      setPosts(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setFetchError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    
    // Validation
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!summary.trim()) newErrors.summary = 'Summary is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      return;
    }

    try {
      console.log('Submitting post to:', API_URL);
      
      // Create the post object
      const postData = { 
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim()
      };
      
      console.log('Post data:', postData);
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!res.ok) {
        let errorMessage = 'Failed to create post';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON
          errorMessage = await res.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const newPost = await res.json();
      setPosts([newPost, ...posts]);
      setTitle('');
      setSummary('');
      setContent('');
      alert('Post created successfully!');

    } catch (err) {
      console.error('Post creation error:', err);
      alert(err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete post');
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete post');
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Segoe UI, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        color: '#2c3e50',
        borderBottom: '2px solid #3498db',
        paddingBottom: '1rem',
        marginBottom: '2rem'
      }}>
        🧠 Prathap's AI Blog
      </h1>

      {fetchError && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {fetchError}
          <p>Make sure your backend is running on http://localhost:5000</p>
          <button 
            onClick={fetchPosts}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ 
        marginBottom: '2rem',
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ 
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${errors.title ? '#e74c3c' : '#ddd'}`,
              borderRadius: '4px'
            }}
          />
          {errors.title && <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.title}</div>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Summary
          </label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={{ 
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${errors.summary ? '#e74c3c' : '#ddd'}`,
              borderRadius: '4px'
            }}
          />
          {errors.summary && <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.summary}</div>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ 
              width: '100%',
              padding: '0.5rem',
              border: `1px solid ${errors.content ? '#e74c3c' : '#ddd'}`,
              borderRadius: '4px',
              minHeight: '150px',
              resize: 'vertical'
            }}
          />
          {errors.content && <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.content}</div>}
        </div>

        <button 
          type="submit"
          disabled={submitting}
          style={{
            backgroundColor: submitting ? '#95a5a6' : '#3498db',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => !submitting && (e.target.style.backgroundColor = '#2980b9')}
          onMouseOut={(e) => !submitting && (e.target.style.backgroundColor = '#3498db')}
        >
          {submitting ? 'Creating...' : 'Create Post'}
        </button>
      </form>

      <hr style={{ margin: '2rem 0' }} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ 
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p>No posts yet. Be the first to share your AI insights!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div 
            key={post.id}
            style={{ 
              marginBottom: '1.5rem',
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>{post.title}</h3>
            <p style={{ 
              color: '#7f8c8d',
              marginBottom: '1rem',
              fontWeight: '500'
            }}>
              {post.summary}
            </p>
            <p style={{ 
              color: '#34495e',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {post.content}
            </p>
            <button
              onClick={() => deletePost(post.id)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#e74c3c',
                padding: '0.25rem'
              }}
              title="Delete post"
            >
              🗑️
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;