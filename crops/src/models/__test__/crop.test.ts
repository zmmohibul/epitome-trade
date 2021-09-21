import { Crop } from "../crops";

it('implements optimistic concurrency control', async () => {
  // Create an instance of a crop
  const crop = Crop.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // Save the crop to the database
  await crop.save();

  // fetch the crop twice
  const firstInstance = await Crop.findById(crop.id);
  const secondInstance = await Crop.findById(crop.id);

  // make two separate changes to the crops we fetched
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save the first fetched crop
  await firstInstance!.save();

  // save the second fetched crop and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const crop = Crop.build({
    title: 'concert',
    price: 20,
    userId: '123',
  });

  await crop.save();
  expect(crop.version).toEqual(0);
  await crop.save();
  expect(crop.version).toEqual(1);
  await crop.save();
  expect(crop.version).toEqual(2);
});
