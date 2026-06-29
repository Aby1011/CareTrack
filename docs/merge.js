(async () => {
  const { default: PDFMerger } = await import('pdf-merger-js');
  const merger = new PDFMerger();
  
  await merger.add('level_0.pdf');
  await merger.add('patient_level_1.pdf');
  await merger.add('admin_level_1.pdf');
  await merger.add('doctor_level_1.pdf');
  await merger.add('nurse_level_1.pdf');
  
  await merger.save('CareTrack_DFD_System.pdf');
  console.log('Merged into CareTrack_DFD_System.pdf successfully');
})();
