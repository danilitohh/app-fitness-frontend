import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from './firebase';
import { requestPermissionAndGetToken, onMessageListener } from './firebase';
import Dashboard from "./Dashboard";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css';
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Navbar
function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    navigate('/');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <div className="container-fluid">
        <Link to="/profile" className="navbar-brand">Mi App Fitness</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/profile" className="nav-link">Perfil</Link>
            </li>
            <li className="nav-item">
              <Link to="/routines" className="nav-link">Rutinas</Link>
            </li>
            <li className="nav-item">
              <Link to="/progress" className="nav-link">Progreso</Link>
            </li>
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </li>
          </ul>
          <button onClick={handleLogout} className="btn btn-outline-light">Cerrar sesión</button>
        </div>
      </div>
    </nav>
  );
}

// Home
function Home() {
  const navigate = useNavigate();
  return (
    <header className="App-header container text-center mt-5 px-3">
      <h1>Mi App Fitness 💪</h1>
      <p>¡Bienvenido a tu nuevo estilo de vida!</p>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="btn btn-primary"
        onClick={() => navigate('/login')}
      >
        Comenzar
      </motion.button>
    </header>
  );
}

// Login
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingresa un correo válido.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("¡Bienvenido!");
      setEmail("");
      setPassword("");
      navigate('/profile');
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <form aria-label="Formulario de inicio de sesión" className="container mt-5 px-3">
      <div className="bg-white shadow-sm rounded p-4 mx-auto" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center" tabIndex="0">Inicia sesión</h2>
        <div className="mb-3">
          <label htmlFor="emailInput" className="form-label">Correo electrónico</label>
          <input
            id="emailInput"
            type="email"
            className="form-control"
            placeholder="Correo electrónico"
            aria-required="true"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="passwordInput" className="form-label">Contraseña</label>
          <input
            id="passwordInput"
            type="password"
            className="form-control"
            placeholder="Contraseña"
            aria-required="true"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn btn-primary w-100"
          aria-label="Botón para iniciar sesión"
          type="button"
          onClick={handleLogin}
        >
          Iniciar sesión
        </motion.button>
        {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
        <p className="mt-3 text-center">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </form>
  );
}

// Register
function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Cuenta creada con éxito 🎉");
      setEmail("");
      setPassword("");
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError("Error al crear la cuenta. Intenta con otro correo o una contraseña más segura.");
    }
  };

  return (
    <div className="container mt-5 px-3">
      <div className="bg-white shadow-sm rounded p-4 mx-auto" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">Crear cuenta</h2>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button className="btn btn-success w-100" onClick={handleRegister}>Registrarse</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {success && <div className="alert alert-success mt-3">{success}</div>}
      </div>
    </div>
  );
}

// Profile
function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [profileData, setProfileData] = React.useState({
    name: '',
    age: '',
    height: '',
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      } catch (err) {
        setError('Error al cargar datos del perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profileData.name || !profileData.age || !profileData.height) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setError('');
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        name: profileData.name,
        age: profileData.age,
        height: profileData.height,
      });
      setSuccess('Perfil guardado con éxito');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar el perfil');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch {
      // manejar error
    }
  };

  if (!user) return <p>No hay usuario autenticado.</p>;

  if (loading) return <p>Cargando perfil...</p>;

  return (
    <div className="container mt-5 px-3">
      <div className="bg-white shadow-sm rounded p-4 mx-auto" style={{ maxWidth: '600px' }}>
        <h2 className="mb-4">Perfil</h2>
        <div className="mb-3">
          <label htmlFor="nameInput" className="form-label">Nombre</label>
          <input
            id="nameInput"
            type="text"
            className="form-control"
            name="name"
            value={profileData.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="ageInput" className="form-label">Edad</label>
          <input
            id="ageInput"
            type="number"
            className="form-control"
            name="age"
            value={profileData.age}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="heightInput" className="form-label">Altura (cm)</label>
          <input
            id="heightInput"
            type="number"
            className="form-control"
            name="height"
            value={profileData.height}
            onChange={handleChange}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {success && <div className="alert alert-success mt-3">{success}</div>}
      </div>
    </div>
  );
}

// Routines
function Routines() {
  const [routines, setRoutines] = React.useState([]);
  const [newRoutine, setNewRoutine] = React.useState("");
  const [routineTime, setRoutineTime] = React.useState("");
  const user = auth.currentUser;

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "routines"), where("userEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRoutines(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddRoutine = async () => {
    if (newRoutine.trim() === "") return;
    try {
      await addDoc(collection(db, "routines"), {
        name: newRoutine,
        time: routineTime,
        userEmail: user.email,
      });
      setNewRoutine("");
      setRoutineTime("");
    } catch (err) {
      console.error("Error al guardar rutina:", err);
    }
  };

  const handleDeleteRoutine = async (id) => {
    try {
      await deleteDoc(doc(db, "routines", id));
    } catch (error) {
      console.error("Error al eliminar rutina:", error);
    }
  };

  if (!user) return <p>Inicia sesión para ver tus rutinas.</p>;

  return (
    <div className="container mt-5 px-3">
      <div className="bg-white shadow-sm rounded p-4 mx-auto" style={{ maxWidth: '600px' }}>
        <h2 className="mb-4">Rutinas</h2>

        <ul className="list-group mb-3">
          {routines.map(routine => (
            <li key={routine.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{routine.name}</strong>
                {routine.time && (
                  <div className="text-muted small">
                    ⏰ {new Date(routine.time).toLocaleString("es-CO")}
                  </div>
                )}
              </div>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteRoutine(routine.id)}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>

        <input
          type="text"
          className="form-control mb-2"
          placeholder="Nombre de la rutina"
          value={newRoutine}
          onChange={(e) => setNewRoutine(e.target.value)}
        />

        <input
          type="datetime-local"
          className="form-control mb-3"
          value={routineTime}
          onChange={(e) => setRoutineTime(e.target.value)}
        />

        <button className="btn btn-primary w-100" onClick={handleAddRoutine}>Agregar rutina</button>
      </div>
    </div>
  );
}

// Progress mejorado
function Progress() {
  const [weights, setWeights] = React.useState([]);
  const [weightValue, setWeightValue] = React.useState("");
  const [weightDate, setWeightDate] = React.useState("");
  const [routines, setRoutines] = React.useState([]);
  const [routineName, setRoutineName] = React.useState("");
  const [routineDate, setRoutineDate] = React.useState("");
  const user = auth.currentUser;

  // Cargar pesos
  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "weights"), where("userEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      // Ordenar por fecha
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setWeights(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Cargar rutinas completadas
  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "completedRoutines"), where("userEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      // Ordenar por fecha
      data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setRoutines(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Guardar peso
  const handleAddWeight = async () => {
    if (!weightValue || !weightDate) return;
    try {
      await addDoc(collection(db, "weights"), {
        value: parseFloat(weightValue),
        date: weightDate,
        userEmail: user.email,
      });
      setWeightValue("");
      setWeightDate("");
    } catch (err) {
      console.error("Error al guardar peso:", err);
    }
  };

  // Guardar rutina completada
  const handleAddRoutine = async () => {
    if (!routineName || !routineDate) return;
    try {
      await addDoc(collection(db, "completedRoutines"), {
        name: routineName,
        date: routineDate,
        userEmail: user.email,
      });
      setRoutineName("");
      setRoutineDate("");
    } catch (err) {
      console.error("Error al guardar rutina completada:", err);
    }
  };

  if (!user) return <p>Inicia sesión para ver tu progreso.</p>;

  // Datos para gráfica de peso
  const weightChartData = {
    labels: weights.map(w => new Date(w.date).toLocaleDateString("es-CO")),
    datasets: [
      {
        label: "Peso (kg)",
        data: weights.map(w => w.value),
        fill: false,
        borderColor: "#007bff",
        backgroundColor: "#007bff",
      },
    ],
  };

  // Datos para gráfica de rutinas completadas por día
  const routinesByDate = routines.reduce((acc, r) => {
    const date = new Date(r.date).toLocaleDateString("es-CO");
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const routineChartData = {
    labels: Object.keys(routinesByDate),
    datasets: [
      {
        label: "Rutinas completadas",
        data: Object.values(routinesByDate),
        fill: false,
        borderColor: "#28a745",
        backgroundColor: "#28a745",
      },
    ],
  };

  return (
    <div className="container mt-5 px-3">
      <div className="bg-white shadow-sm rounded p-4 mx-auto" style={{ maxWidth: '800px' }}>
        <h2 className="mb-4">Progreso</h2>
        {/* Peso corporal */}
        <h4>Peso corporal</h4>
        <div className="row mb-4">
          <div className="col-md-6">
            <input
              type="number"
              className="form-control mb-2"
              placeholder="Peso (kg)"
              value={weightValue}
              onChange={e => setWeightValue(e.target.value)}
            />
            <input
              type="date"
              className="form-control mb-2"
              value={weightDate}
              onChange={e => setWeightDate(e.target.value)}
            />
            <button className="btn btn-primary w-100 mb-3" onClick={handleAddWeight}>Registrar peso</button>
          </div>
          <div className="col-md-6">
            <Line data={weightChartData} />
          </div>
        </div>
        {/* Rutinas completadas */}
        <h4>Rutinas completadas</h4>
        <div className="row mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Nombre de la rutina"
              value={routineName}
              onChange={e => setRoutineName(e.target.value)}
            />
            <input
              type="date"
              className="form-control mb-2"
              value={routineDate}
              onChange={e => setRoutineDate(e.target.value)}
            />
            <button className="btn btn-success w-100 mb-3" onClick={handleAddRoutine}>Registrar rutina completada</button>
          </div>
          <div className="col-md-6">
            <Line data={routineChartData} />
          </div>
        </div>
        {/* Historial de rutinas completadas */}
        <h5>Historial de rutinas completadas</h5>
        <ul className="list-group mb-3">
          {routines.map(routine => (
            <li key={routine.id} className="list-group-item">
              <div>
                <strong>{routine.name}</strong>
                {routine.date && (
                  <div className="text-muted small">
                    📅 {new Date(routine.date).toLocaleDateString("es-CO")}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Custom Routines
function CustomRoutines() {
  const [routines, setRoutines] = React.useState([]);
  const [routineName, setRoutineName] = React.useState("");
  const [routineDesc, setRoutineDesc] = React.useState("");
  const [exercises, setExercises] = React.useState([]);
  const [exercise, setExercise] = React.useState({
    name: "",
    sets: "",
    reps: "",
    area: "",
    imageUrl: "",
    notes: ""
  });
  const [editingId, setEditingId] = React.useState(null);
  const user = auth.currentUser;

  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "customRoutines"), where("userEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRoutines(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleExerciseChange = (e) => {
    setExercise({ ...exercise, [e.target.name]: e.target.value });
  };

  const addExercise = () => {
    if (!exercise.name || !exercise.sets || !exercise.reps || !exercise.area || !exercise.imageUrl) return;
    setExercises([...exercises, exercise]);
    setExercise({ name: "", sets: "", reps: "", area: "", imageUrl: "", notes: "" });
  };

  const removeExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setRoutineName("");
    setRoutineDesc("");
    setExercises([]);
    setEditingId(null);
  };

  const handleSaveRoutine = async () => {
    if (!routineName || !routineDesc || exercises.length === 0) return;
    const routineData = {
      name: routineName,
      description: routineDesc,
      exercises,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
    };
    try {
      if (editingId) {
        await setDoc(doc(db, "customRoutines", editingId), routineData);
      } else {
        await addDoc(collection(db, "customRoutines"), routineData);
      }
      resetForm();
    } catch (err) {
      console.error("Error al guardar rutina personalizada:", err);
    }
  };

  const handleEditRoutine = (routine) => {
    setRoutineName(routine.name);
    setRoutineDesc(routine.description);
    setExercises(routine.exercises);
    setEditingId(routine.id);
  };

  const handleDeleteRoutine = async (id) => {
    try {
      await deleteDoc(doc(db, "customRoutines", id));
    } catch (err) {
      console.error("Error al eliminar rutina personalizada:", err);
    }
  };

  if (!user) return <p>Inicia sesión para gestionar tus rutinas personalizadas.</p>;

  return (
    <div className="container mt-5 px-3">
      <div className="bg-white shadow-sm rounded p-4 mx-auto" style={{ maxWidth: '900px' }}>
        <h2 className="mb-4">Rutinas Personalizadas</h2>
        <div className="mb-4">
          <h4>{editingId ? "Editar rutina" : "Crear nueva rutina"}</h4>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Nombre de la rutina"
            value={routineName}
            onChange={e => setRoutineName(e.target.value)}
          />
          <textarea
            className="form-control mb-2"
            placeholder="Descripción de la rutina"
            value={routineDesc}
            onChange={e => setRoutineDesc(e.target.value)}
          />
          <h5>Ejercicios</h5>
          <div className="row g-2 align-items-end">
            <div className="col-md-2">
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Nombre"
                value={exercise.name}
                onChange={handleExerciseChange}
              />
            </div>
            <div className="col-md-1">
              <input
                type="number"
                className="form-control"
                name="sets"
                placeholder="Series"
                value={exercise.sets}
                onChange={handleExerciseChange}
              />
            </div>
            <div className="col-md-1">
              <input
                type="number"
                className="form-control"
                name="reps"
                placeholder="Reps"
                value={exercise.reps}
                onChange={handleExerciseChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                className="form-control"
                name="area"
                placeholder="Área muscular"
                value={exercise.area}
                onChange={handleExerciseChange}
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                name="imageUrl"
                placeholder="URL de imagen"
                value={exercise.imageUrl}
                onChange={handleExerciseChange}
              />
            </div>
            <div className="col-md-2">
              <input
                type="text"
                className="form-control"
                name="notes"
                placeholder="Notas (opcional)"
                value={exercise.notes}
                onChange={handleExerciseChange}
              />
            </div>
            <div className="col-md-1">
              <button className="btn btn-secondary w-100" onClick={addExercise} type="button">+</button>
            </div>
          </div>
          <ul className="list-group mt-2 mb-2">
            {exercises.map((ex, idx) => (
              <li key={idx} className="list-group-item d-flex align-items-center justify-content-between">
                <span>
                  <strong>{ex.name}</strong> | {ex.sets}x{ex.reps} | {ex.area}
                  {ex.imageUrl && <img src={ex.imageUrl} alt="img" style={{height:30, marginLeft:10}} />}
                  {ex.notes && <span className="text-muted ms-2">({ex.notes})</span>}
                </span>
                <button className="btn btn-sm btn-danger" onClick={() => removeExercise(idx)}>Eliminar</button>
              </li>
            ))}
          </ul>
          <button className="btn btn-primary me-2" onClick={handleSaveRoutine}>{editingId ? "Guardar cambios" : "Crear rutina"}</button>
          {editingId && <button className="btn btn-secondary" onClick={resetForm}>Cancelar</button>}
        </div>
        <h4>Mis rutinas</h4>
        <ul className="list-group">
          {routines.map(routine => (
            <li key={routine.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{routine.name}</strong> <span className="text-muted">({routine.description})</span>
                  <ul className="mb-0 mt-2">
                    {routine.exercises.map((ex, i) => (
                      <li key={i}>
                        <strong>{ex.name}</strong> | {ex.sets}x{ex.reps} | {ex.area}
                        {ex.imageUrl && <img src={ex.imageUrl} alt="img" style={{height:30, marginLeft:10}} />}
                        {ex.notes && <span className="text-muted ms-2">({ex.notes})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <button className="btn btn-sm btn-info me-2" onClick={() => handleEditRoutine(routine)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRoutine(routine.id)}>Eliminar</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// App principal
function App() {
  React.useEffect(() => {
    requestPermissionAndGetToken();

    onMessageListener((payload) => {
      alert(`Notificación recibida: ${payload.notification.title} - ${payload.notification.body}`);
    });
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/custom-routines" element={<CustomRoutines />} />
      </Routes>
    </Router>
  );
}

export default App;