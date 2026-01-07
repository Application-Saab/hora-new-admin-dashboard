const CheckboxGroup = ({
  title,
  items,
  section,
  checklist,
  onChange
}) => {
  return (
    <>
      <div className="label-heading">{title}</div>
      <div className="checkbox-container">
        {items.map(item => (
          <label key={item} className="checkbox-label">
            <input
              type="checkbox"
              checked={checklist[section]?.[item] || false}
              onChange={() => onChange(section, item)}
            />
            {item}
          </label>
        ))}
      </div>
    </>
  );
};

export default CheckboxGroup ;