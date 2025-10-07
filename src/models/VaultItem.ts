import mongoose, { Document, Schema } from 'mongoose';

interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  encryptedData: string; // This will contain the encrypted JSON of title, username, password, url, notes
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    encryptedData: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);
