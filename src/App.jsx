import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./routes/Landing";
import TeacherCreate from "./routes/TeacherCreate";
import TeacherDashboard from "./routes/TeacherDashboard";
import TeacherCompareFullscreen from "./routes/TeacherCompareFullscreen";
import StudentJoin from "./routes/StudentJoin";
import StudentPlay from "./routes/StudentPlay";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/teacher/new" element={<TeacherCreate />} />
        <Route path="/teacher/:pin" element={<TeacherDashboard />} />
        <Route path="/teacher/:pin/compare" element={<TeacherCompareFullscreen />} />
        <Route path="/join" element={<StudentJoin />} />
        <Route path="/play/:pin" element={<StudentPlay />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
