function SectionHeader({ eyebrow, title, description, actionLabel }) {
  return (
    <div className="section-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actionLabel && <button className="secondary-button" type="button">{actionLabel}</button>}
    </div>
  );
}

export default SectionHeader;
