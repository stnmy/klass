import { useUser } from "../context/userContext";

const Dashboard = () => {
  const { user } = useUser();

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>

      {user.role === "Teacher" && (
        <div>
          <button>Create Class</button>
          <button>Change Group</button>
          <button>Create User</button>
        </div>
      )}

      {user.role === "Student" && (
        <div>
          <p>View your classes</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
