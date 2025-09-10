import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface QueueItem {
  id: number;
  customer: string;
  description: string;
  fullDescription: string;
  phone: string;
  email: string;
}

interface QueueData {
  [key: string]: QueueItem[];
}

function StaffQueueing() {
  const [selectedDate, setSelectedDate] = useState(new Date("2025-01-15"));
  const [selectedQueue, setSelectedQueue] = useState<QueueItem | null>(null);

  // Sample queue data - in a real app this would come from a database
  const queueData: QueueData = {
    "2025-09-03": [
      {
        id: 1,
        customer: "John Doe",
        description: "Brake adjustment and tire replacement",
        fullDescription:
          "Customer reports squeaking brakes and worn front tire. Need to adjust brake pads, check brake cables, and replace 700c x 25mm front tire. Also inspect rear brake for preventive maintenance.",
        phone: "(555) 123-4567",
        email: "john.doe@email.com",
      },
      {
        id: 2,
        customer: "Sarah Smith",
        description: "Chain repair and gear tuning",
        fullDescription:
          "Chain has been skipping gears, especially in higher gears. Need to clean and lubricate chain, adjust derailleur tension, and fine-tune gear indexing. Customer mentioned chain may have stretched.",
        phone: "(555) 234-5678",
        email: "sarah.smith@email.com",
      },
    ],
    "2025-09-04": [
      {
        id: 3,
        customer: "Mike Johnson",
        description: "Full tune-up service",
        fullDescription:
          "Complete bike overhaul requested. Includes brake adjustment, gear tuning, wheel truing, chain cleaning and lubrication, tire pressure check, bearing inspection, and general safety check. Bike hasn't been serviced in over a year.",
        phone: "(555) 345-6789",
        email: "mike.johnson@email.com",
      },
    ],
    "2025-01-17": [
      {
        id: 4,
        customer: "Lisa Chen",
        description: "Wheel truing and spoke replacement",
        fullDescription:
          "Front wheel is wobbling significantly. Several spokes appear loose or damaged. Need to true the wheel and replace any broken spokes. Check rim for damage.",
        phone: "(555) 456-7890",
        email: "lisa.chen@email.com",
      },
      {
        id: 5,
        customer: "David Wilson",
        description: "Brake pad replacement",
        fullDescription:
          "Both front and rear brake pads are worn down to metal. Need immediate replacement of brake pads and inspection of brake rotors for scoring or warping. Customer reports grinding noise.",
        phone: "(555) 567-8901",
        email: "david.wilson@email.com",
      },
    ],
    "2025-01-20": [
      {
        id: 6,
        customer: "Emma Brown",
        description: "Derailleur adjustment",
        fullDescription:
          "Rear derailleur is not shifting smoothly between gears. Likely needs cable tension adjustment and limit screw tuning. Customer reports difficulty shifting to largest cog.",
        phone: "(555) 678-9012",
        email: "emma.brown@email.com",
      },
    ],
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const currentDateKey = formatDate(selectedDate);
  const currentQueue = queueData[currentDateKey] || [];

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-base-content mb-8 text-3xl font-bold">
          Service Queue Management
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Date Selector and Queue List */}
          <div className="space-y-6 lg:col-span-2">
            {/* Date Selector with React Day Picker */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Select Date</h2>
                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={[
                      { dayOfWeek: [0, 6] }, // Disable weekends
                      { before: new Date() }, // Disable past dates
                    ]}
                    className="bg-base-100 rounded-lg border p-4"
                  />
                </div>
                <div className="text-base-content/70 mt-4 text-center text-sm">
                  Showing queue for{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="mt-2 flex justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="bg-primary h-3 w-3 rounded-full"></div>
                    <span className="text-xs">Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-accent h-3 w-3 rounded-full"></div>
                    <span className="text-xs">Booked</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-base-300 h-3 w-3 rounded-full"></div>
                    <span className="text-xs">Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Queue List */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="card-title">
                    Service Queue ({currentQueue.length} items)
                  </h2>
                  <button className="btn btn-primary btn-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Service
                  </button>
                </div>

                {currentQueue.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mb-4 text-6xl opacity-20">🔧</div>
                    <h3 className="mb-2 text-lg font-semibold">
                      No services scheduled
                    </h3>
                    <p className="text-base-content/60">
                      No repair services are scheduled for this date.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentQueue.map((item, index) => (
                      <div
                        key={item.id}
                        className="border-base-300 hover:bg-base-200 cursor-pointer rounded-lg border p-4 transition-colors"
                        onClick={() => setSelectedQueue(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <div className="badge badge-primary">
                                #{index + 1}
                              </div>
                              <h3 className="font-semibold">{item.customer}</h3>
                              <div className="badge badge-outline">
                                {item.phone}
                              </div>
                            </div>
                            <p className="text-base-content/70 mb-2 text-sm">
                              {item.description}
                            </p>
                            <div className="flex gap-2">
                              <span className="badge badge-info badge-sm">
                                Pending
                              </span>
                              <span className="text-base-content/50 text-xs">
                                Est. 1-2 hours
                              </span>
                            </div>
                          </div>
                          <div className="dropdown dropdown-end">
                            <div
                              tabIndex={0}
                              role="button"
                              className="btn btn-ghost btn-sm"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                />
                              </svg>
                            </div>
                            <ul
                              tabIndex={0}
                              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                            >
                              <li>
                                <a>Mark as In Progress</a>
                              </li>
                              <li>
                                <a>Mark as Completed</a>
                              </li>
                              <li>
                                <a className="text-warning">Reschedule</a>
                              </li>
                              <li>
                                <a className="text-error">Cancel</a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

                     {/* Service Details Panel */}
           <div className="space-y-6">
             {/* Selected Service Details */}
             {selectedQueue && (
               <div className="card bg-base-100 shadow-lg">
                 <div className="card-body">
                   <h2 className="card-title mb-4 text-lg">Service Details</h2>

                   <div className="space-y-4">
                     <div>
                       <label className="text-base-content/70 text-sm font-semibold">
                         Customer
                       </label>
                       <p className="font-semibold">{selectedQueue.customer}</p>
                     </div>

                     <div>
                       <label className="text-base-content/70 text-sm font-semibold">
                         Contact
                       </label>
                       <p className="text-sm">{selectedQueue.phone}</p>
                       <p className="text-base-content/70 text-sm">
                         {selectedQueue.email}
                       </p>
                     </div>

                     <div>
                       <label className="text-base-content/70 text-sm font-semibold">
                         Service Description
                       </label>
                       <p className="text-sm">{selectedQueue.fullDescription}</p>
                     </div>

                     <div className="flex gap-2 pt-4">
                       <button className="btn btn-success btn-sm flex-1">
                         Start Service
                       </button>
                       <button className="btn btn-outline btn-sm">Edit</button>
                     </div>
                   </div>
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default StaffQueueing;
