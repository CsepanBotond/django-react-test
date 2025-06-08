import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FunctionComponent,
} from "react";
import { API_BASE } from "../constants";
import Button from "./Button";
import type { Appointment, Department } from "../types";

const AppointmentDialog: FunctionComponent<
  ComponentPropsWithRef<"dialog"> & { appointmentId: number }
> = ({ ref, appointmentId }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDetpartments] = useState<Department[] | null>(null);

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
        setAppointment(data);

        const deps = await resp2.json();
        setDetpartments(deps);

        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

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
      className="p-4 bg-slate-400 rounded m-auto max-w-3xl"
    >
      <div className="flex flex-col w-full h-full">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h1 className="text-center">{appointment?.title}</h1>
            <form action="" className="flex flex-col gap-3">
              <div></div>
              <select name="departments" id="departments">
                <option value="">Select department</option>
                {departments?.map((d) => (
                  <option value={d.id}>{d.name}</option>
                ))}
              </select>
              <div className="flex w-full justify-end gap-1">
                <Button text={"Save"} onClick={() => alert("Not implemented")}></Button>
                <Button text={"Update"} onClick={() => alert("Not implemented")}></Button>
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
