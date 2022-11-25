import { AptosAccount } from "aptos";
import { NextApiRequest, NextApiResponse } from "next";
import { client } from "../../../common/utils";
import { connectToDatabase, User } from "../../../lib/mongodb";

export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { address },
    method,
  } = req;

  await connectToDatabase();

  try {
    switch (method) {
      case "GET":
        const acc = await client.getAccount(address as string);
        const result = await getAccount(address as string);
        res.status(200).json(result);
        break;
      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error: any) {
    if (error?.status && error?.errorCode) {
      res.status(error?.status).json({ message: error?.errorCode });
    } else {
      res.status(500).json(error);
    }
  }
}

const getAccount = async (address: string) => {
  const user = await User.findOne({
    address,
  }).exec();
  if (!user) {
    const newUser = await User.create({
      address,
      nonce: Math.floor(Math.random() * 1000000),
    });
    return newUser;
  }
  return user;
};
