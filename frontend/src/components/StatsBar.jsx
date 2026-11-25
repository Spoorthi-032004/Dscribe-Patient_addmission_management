export default function StatsBar({ patients, activeStatus, onStatusSelect }) {
  const total = patients.length;
  const admitted = patients.filter((p) => p.status === "Admitted").length;
  const discharged = patients.filter((p) => p.status === "Discharged").length;

  const cards = [
    {
      key: "",
      label: "All Records",
      value: total,
      tone: "neutral",
      hint: "View admitted & discharged",
    },
    {
      key: "Admitted",
      label: "Currently Admitted",
      value: admitted,
      tone: "admitted",
      hint: "Active in-patient care",
    },
    {
      key: "Discharged",
      label: "Discharged",
      value: discharged,
      tone: "discharged",
      hint: "Completed admissions",
    },
  ];

  return (
    <section className="stats-grid" aria-label="Admission summary">
      {cards.map((card) => {
        const isActive = activeStatus === card.key;
        return (
          <button
            key={card.label}
            type="button"
            onClick={() => onStatusSelect(card.key)}
            className={`stat-card stat-${card.tone} ${isActive ? "is-active" : ""}`}
          >
            <div className="stat-top">
              <span className="stat-label">{card.label}</span>
              <span className={`stat-dot dot-${card.tone}`} />
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-hint">{card.hint}</div>
          </button>
        );
      })}
    </section>
  );
}
