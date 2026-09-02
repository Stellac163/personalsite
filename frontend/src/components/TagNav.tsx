interface Props {
  tags: string[];
  active: string;
  onChange: (tag: string) => void;
}

export default function TagNav({ tags, active, onChange }: Props) {
  return (
    <nav className="tag-nav">
      {tags.map((t) => (
        <button
          key={t}
          className={`tag-nav__item${t === active ? " tag-nav__item--active" : ""}`}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </nav>
  );
}
