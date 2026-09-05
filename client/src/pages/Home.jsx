import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users } from 'lucide-react';
import api from '../services/api';
import TopNav from '../components/TopNav';

export default function Home() {
  const [trainers, setTrainers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError('');
        const [trainerResponse, courseResponse] = await Promise.all([
          api.get('/public/trainers'),
          api.get('/public/courses'),
        ]);

        if (!active) return;

        setTrainers(Array.isArray(trainerResponse.data?.trainers) ? trainerResponse.data.trainers : []);
        setCourses(Array.isArray(courseResponse.data?.courses) ? courseResponse.data.courses : []);
      } catch (err) {
        if (!active) return;
        console.error('Home data loading failed:', err);
        setTrainers([]);
        setCourses([]);
        setError(err.response?.data?.message || 'Unable to load training data. Please refresh the page.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHomeData();
    return () => { active = false; };
  }, []);

  return (
    <>
      <TopNav />
      <main>
        <section className="hero">
          <div>
            <span className="eyebrow">INDUSTRY-READY TRAINING PLATFORM</span>
            <h1>Learn today.<br /><em>Build tomorrow.</em></h1>
            <p>Practical training led by experienced developers. Learn Java, Python and MERN through structured topics, tasks and daily attendance.</p>
            <div className="hero-actions">
              <Link className="primary inline" to="/tasks">Explore Courses <ArrowRight size={17} /></Link>
              <Link className="secondary" to="/attendance">Mark Attendance</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="code-window">
              <div className="dots">● ● ●</div>
              <code><span>const</span> future = <b>true</b>;<br /><span>learn</span>(skills);<br /><span>build</span>(projects);<br /><span>repeat</span>();</code>
              <div className="progress"><div /><span>Learning progress · 88%</span></div>
            </div>
          </div>
        </section>

        {error && <div className="alert home-alert">{error}</div>}

        <section className="section">
          <div className="section-title">
            <div><span className="eyebrow">OUR EXPERTS</span><h2>Meet the trainers</h2></div>
            <span>{loading ? 'Loading…' : `${trainers.length} mentors`}</span>
          </div>

          {loading ? (
            <div className="empty-state">Loading trainers…</div>
          ) : trainers.length ? (
            <div className="trainer-grid">
              {trainers.map((trainer) => {
                const name = trainer?.name || 'Trainer';
                return (
                  <article className="trainer-card" key={trainer._id}>
                    {trainer.profileImage ? (
                      <img src={trainer.profileImage} alt={name} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className="avatar">{name.slice(0, 2).toUpperCase()}</div>
                    )}
                    <h3>{name}</h3>
                    <p>{trainer.designation || 'Professional Trainer'}</p>
                    <div className="trainer-meta">
                      <span>{trainer.experience || 'Industry Expert'}</span>
                      <span>{trainer.specialization || 'Software Development'}</span>
                    </div>
                    {trainer.description && <small className="trainer-description">{trainer.description}</small>}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No trainers available yet.</div>
          )}
        </section>

        <section className="section soft">
          <div className="section-title">
            <div><span className="eyebrow">LEARNING PATHS</span><h2>Choose your course</h2></div>
            <Link to="/tasks">View all <ArrowRight size={15} /></Link>
          </div>

          {loading ? (
            <div className="empty-state">Loading courses…</div>
          ) : courses.length ? (
            <div className="course-grid">
              {courses.map((course) => {
                const topicCount = Array.isArray(course?.topics) ? course.topics.length : 0;
                return (
                  <Link to="/tasks" className="course-card" key={course._id}>
                    <div className="course-icon">{course.icon || '📚'}</div>
                    <h3>{course.name || 'Course'}</h3>
                    <p>{course.description || 'Practical developer training.'}</p>
                    <div>
                      <span><BookOpen size={14} /> {topicCount} topics</span>
                      <span><Users size={14} /> 5 tasks/topic</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No courses available yet.</div>
          )}
        </section>
      </main>
    </>
  );
}
