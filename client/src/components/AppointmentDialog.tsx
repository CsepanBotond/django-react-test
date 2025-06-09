import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FunctionComponent,
} from "react";
import DatePicker from "react-datepicker";
import { API_BASE } from "../constants";
import type { Appointment, Department, Employee } from "../types";
import Button from "./Button";

const AppointmentDialog: FunctionComponent<
  ComponentPropsWithRef<"dialog"> & { appointmentId: number }
> = ({ ref, appointmentId }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDetpartments] = useState<Department[] | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [departmentEmployees, setDepartmentEmployees] = useState<Employee[]>(
    []
  );

  useEffect(() => {
    setIsLoading(true);

    const fetchAppointmentDetails = async () => {
      try {
        if (!appointmentId) {
          console.error("No such appointment");
          return;
        }

        const resp = await fetch(
          new URL(`/appointments/${appointmentId}/`, API_BASE)
        );

        if (!resp.ok) {
          throw Error(`The server responded with error ${resp.status}`);
        }

        const resp2 = await fetch(new URL("/departments/", API_BASE));
        if (!resp2.ok) {
          throw Error(`The server respoinded with error ${resp2.status}`);
        }

        const data = await resp.json();
        setAppointment({
          ...data,
          start: new Date(data.start),
          end: new Date(data.end),
        });

        const deps = await resp2.json();
        setDetpartments(deps);

        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  useEffect(() => {
    const fetchDepartmentEmployees = async () => {
      try {
        if (!selectedDepartment) {
          throw Error("No department selected");
        }

        const resp = await fetch(
          new URL(`/departments/${selectedDepartment.id}/employees/`, API_BASE)
        );

        if (!resp.ok) {
          throw Error(`Server responded with error ${resp.status}`);
        }

        const data = await resp.json();

        console.log(data);

        setDepartmentEmployees(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDepartmentEmployees();
  }, [selectedDepartment]);

  return (
    <dialog
      ref={(node) => {
        if (ref) {
          if ("current" in ref) {
            ref.current = node;
          } else {
            ref(node);
          }
        }
        dialogRef.current = node;
      }}
      className="p-4 dark:bg-zinc-800 bg-sky-50 rounded m-auto max-w-3xl overflow-visible"
    >
      <div className="flex flex-col w-full h-full">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h1 className="text-center">{appointment?.title}</h1>
            <form action="" className="flex flex-col gap-3">
              <div className="flex gap-4">
                <div>
                  <label htmlFor="startpicker"></label>
                  <DatePicker
                    id="startpicker"
                    selected={appointment?.start}
                    showTimeSelect
                    dateFormat={"Pp"}
                  ></DatePicker>
                </div>
                <div>
                  <label htmlFor="endpicker"></label>
                  <DatePicker
                    id="endpicker"
                    selected={appointment?.end}
                    showTimeSelect
                    dateFormat={"Pp"}
                  ></DatePicker>
                </div>
              </div>
              <select
                name="departments"
                id="departments"
                onChange={(event) =>
                  setSelectedDepartment(
                    departments?.find(
                      ({ id }) => id.toString() === event.target.value
                    ) ?? null
                  )
                }
              >
                <option value="" className="dark:bg-zinc-800" disabled>
                  Select department
                </option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id} className="dark:bg-zinc-800">
                    {d.name}
                  </option>
                ))}
              </select>
              {departmentEmployees.length ? (
                departmentEmployees?.map((e) => {
                  return (
                    <div className="flex justify-between">
                      <span>{e.name}</span>
                      <Button
                        text="×"
                        onClick={() =>
                          alert("Remove participant (not implemented)")
                        }
                      ></Button>
                    </div>
                  );
                })
              ) : (
                <p>There are no participants for this appointment</p>
              )}

              <div>
                <Button
                  text="Add participant"
                  onClick={() => alert("Adding participant (not implemented)")}
                ></Button>
              </div>
              <div className="flex w-full justify-end gap-1">
                <Button
                  text={"Save"}
                  onClick={() => alert("Not implemented")}
                ></Button>
                <Button
                  text={"Update"}
                  onClick={() => alert("Not implemented")}
                ></Button>
                <Button
                  text={"Close"}
                  onClick={() => dialogRef.current?.close()}
                ></Button>
              </div>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
};

export default AppointmentDialog;
