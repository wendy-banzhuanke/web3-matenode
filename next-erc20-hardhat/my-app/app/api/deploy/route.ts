import { deployERC20Contract } from "../../../utils/deployERC20";
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { contractAddress } = await deployERC20Contract();
    return NextResponse.json({ contractAddress });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Deployment failed' },
      { status: 500 }
    );
  }
}
