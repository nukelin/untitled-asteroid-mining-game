import './Panel.css'

export default function Panel({ title, focused, children, className = '' }) {
  return (
    <div className={`panel${focused ? ' focused' : ''}${className ? ' ' + className : ''}`}>
      {title && <div className="panel-title">{title}</div>}
      {children}
    </div>
  )
}
