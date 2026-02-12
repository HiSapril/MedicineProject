import { Clock, CheckCircle2 } from 'lucide-react';

export interface TimelineItem {
    id: string;
    time: Date;
    title: string;
    type: 'appointment' | 'reminder';
    status: string;
    link: string;
}

interface DashboardTimelineProps {
    items: TimelineItem[];
    onNavigate: (path: string) => void;
}

const DashboardTimeline = ({ items, onNavigate }: DashboardTimelineProps) => {
    return (
        <section className="timeline-section">
            <h2 className="section-title">
                <Clock size={20} /> Today's Timeline
            </h2>

            <div className="timeline-container">
                {items.length === 0 ? (
                    <div className="empty-timeline">
                        <CheckCircle2 size={48} color="#27ae60" />
                        <p>No scheduled events for today. Enjoy your day!</p>
                    </div>
                ) : (
                    <div className="timeline-list">
                        {items.slice(0, 7).map((item) => (
                            <div key={item.id} className={`timeline-item ${item.type}`}>
                                <div className="time-column">
                                    <span className="time-text">
                                        {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="timeline-marker">
                                    <div className="dot"></div>
                                    <div className="line"></div>
                                </div>
                                <div className="content-column">
                                    <h4 className="item-title">{item.title}</h4>
                                    <span className={`item-status status-${item.status.toLowerCase()}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <button className="item-action-btn" onClick={() => onNavigate(item.link)}>
                                    Details
                                </button>
                            </div>
                        ))}
                        {items.length > 7 && (
                            <div className="timeline-footer">
                                <p>And {items.length - 7} more events...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default DashboardTimeline;
