import { useState } from "react";
import { useForm } from "react-hook-form";
import { useGlobalContext, User } from "../contexts/GlobalContext";
import { http } from "../utils/HttpClient";
import { useHttpErrorHandler } from "../hooks/httpErrorHandler";

type UserInfo = {
   firstname?: string;
   lastname?: string;
   password?: string;
   address?: string;
};

const MyAccountPage = () => {
   const { value, setUser } = useGlobalContext();
   const user = value.user;
   if (!user) return null;
   const defaultValues: UserInfo = {
      firstname: user.firstname,
      lastname: user.lastname,
      address: user.address,
   };
   const [isEditing, setIsEditing] = useState(false);
   const { register, handleSubmit, reset } = useForm<UserInfo>({
      defaultValues: defaultValues,
   });
   const handleHttpError = useHttpErrorHandler();

   const onSubmit = (data: UserInfo) => {
      if (!user) return;

      http
         .patch(`/users/${user.id}`, data)
         .then((response) => {
            setUser(response.data as User);
            setIsEditing(false);
         })
         .catch(handleHttpError);
   };

   const handleCancel = () => {
      setIsEditing(false);
      reset(user);
   };

   if (!user) return <p>Loading user data...</p>;

   return (
      <div className="max-w-md w-full mx-auto p-6 bg-white shadow-md rounded-md mt-10">
         <h1 className="w-full text-xl font-bold mb-4">User Information</h1>
         {!isEditing ? (
            <div>
               <p>
                  <strong>Firstname:</strong> {user.firstname}
               </p>
               <p>
                  <strong>Lastname:</strong> {user.lastname}
               </p>
               <p>
                  <strong>Email:</strong> {user.email}
               </p>
               <p>
                  <strong>Address:</strong>
                  {user.address}
               </p>
               <button onClick={() => setIsEditing(true)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Modify
               </button>
            </div>
         ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
               <div className="mb-4">
                  <label className="block mb-2 font-semibold">Firstname</label>
                  <input type="text" {...register("firstname")} className="w-full px-4 py-2 border rounded-md" autoComplete="off" />
               </div>
               <div className="mb-4">
                  <label className="block mb-2 font-semibold">Lastname</label>
                  <input type="text" {...register("lastname")} className="w-full px-4 py-2 border rounded-md" autoComplete="off" />
               </div>
               <div className="mb-4">
                  <label className="block mb-2 font-semibold">Address</label>
                  <input type="text" {...register("address")} className="w-full px-4 py-2 border rounded-md" autoComplete="off" />
               </div>
               <div className="mb-4">
                  <label className="block mb-2 font-semibold">Password</label>
                  <input type="password" {...register("password")} className="w-full px-4 py-2 border rounded-md" autoComplete="off" />
               </div>
               <div className="mt-4 flex justify-end gap-4">
                  <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">
                     Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                     Submit
                  </button>
               </div>
            </form>
         )}
      </div>
   );
};

export default MyAccountPage;
