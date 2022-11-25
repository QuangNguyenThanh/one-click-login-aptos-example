import { NextApiRequest, NextApiResponse } from "next";
import { client, config } from "../../../common/utils";
import { connectToDatabase, IUser, User } from "../../../lib/mongodb";
import * as Nacl from "tweetnacl";
import jwt from "jsonwebtoken";
import { sha3_256 } from "js-sha3";
import { Model } from "mongoose";

interface RequestBody {
  address: string;
  signature: string;
}
export default async function userHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    body: { address, publicKey, signature, fullMessage },
    method,
  } = req;

  await connectToDatabase();

  try {
    switch (method) {
      case "POST":
        if (!(await validatePublicKey(address, publicKey))) {
          return res.status(401).end();
        }
        const result = await login(address, signature, fullMessage, publicKey);
        if (!result) {
          return res.status(401).end();
        }
        return res.status(200).json(result);
      default:
        res.setHeader("Allow", ["POST"]);
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

const login = async (
  address: string,
  signature: string,
  fullMessage: string,
  publicKey: string
) => {
  const isVerified = verifyMessage(publicKey, signature, fullMessage);
  if (isVerified) {
    const user = await User.findOne({
      address,
    }).exec();
    if (user) {
      user.nonce = Math.floor(Math.random() * 1000000);
      user.save();

      return {
        token: generateJwt(user.id, user.name, user.email, user.address),
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
      };
    }
    return null;
  }
  return null;
};

const validatePublicKey = async (address: string, publicKey: string) => {
  const account = await client.getAccount(address);
  const hashPublicKey = sha3_256(
    Buffer.from(publicKey.substring(2) + "00", "hex")
  );
  return account.authentication_key.substring(2) === hashPublicKey;
};

const verifyMessage = (pub: string, sig: string, fullMessage: string) => {
  const signature = Buffer.from(sig, "hex");
  const pubKey = Buffer.from(pub.substring(2), "hex");
  const verify = Nacl.sign.detached.verify(
    Buffer.from(fullMessage),
    signature,
    pubKey
  );
  return verify;
};

const generateJwt = (
  id: string,
  name: string | undefined,
  email: string | undefined,
  address: string
) => {
  return jwt.sign(
    {
      payload: {
        id,
        name,
        email,
        address,
      },
    },
    config.secret,
    {
      algorithm: config.algorithms[0],
    }
  );
};
