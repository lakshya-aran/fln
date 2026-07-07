import { useAuth } from "@/hooks/useAuth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, {user?.name}
      </h1>
      <p className="mt-1 text-gray-500">
        You are logged in as{" "}
        <span className="font-medium capitalize">
          {user?.role?.replace("_", " ")}
        </span>
      </p>
      <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-gray-600">
          The FLN platform dashboard will be built in the next phase.
        </p>
      </div>
    </div>
  );
}
