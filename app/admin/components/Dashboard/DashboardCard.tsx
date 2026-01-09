import Link from "next/link";
import "./Dashboard.css";

const DashboardCard = ({
  total,
  title,
  bgcolor,
  icon,
}: {
  total: number;
  title: string;
  bgcolor: string;
  icon: any;
}) => {
  const url =
    title === "Post"
      ? "/admin/article"
      : title === "Magazine"
      ? "/admin/magazine"
      : title === "Event"
      ? "/admin/event"
      : "/admin/user";

  return (
    <div className="col-md-6 col-lg-3">
      <Link href={url}>
        <div
          className="card mb-3 border-0 shadow dashboard__card"
        >
          <div className="d-flex justify-content-between card-body">
            <div className="p-4">
              <h2>{total}</h2>
              <h6>{title}</h6>
            </div>
            <div className="d-flex align-items-center">{icon}</div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DashboardCard;
