function MetricCard({ label, value, delta, tone = 'neutral' }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{delta}</small>
    </article>
  );
}

export default MetricCard;
