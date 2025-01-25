import  { db }  from "@/lib/db";


export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({where:{ id }});

        return user;
    } catch {
        return null;
    }
};

export const getUserByStaffNumber = async (staffNumber: string) => {
  try {
    const user = await db.user.findUnique({ where: { staffNumber } });
    return user;
  } catch {
    return null;
  }
};


