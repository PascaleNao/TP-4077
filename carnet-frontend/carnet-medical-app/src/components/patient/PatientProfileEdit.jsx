// src/components/Patient/PatientProfileEdit.jsx

import React, { useState, useEffect } from 'react';
import { updatePatientProfile } from '../../api/medicalApi';

const PatientProfileEdit = ({ initialData, onUpdateSuccess }) => {
    // Utiliser les données initiales pour les états (celles du dossier)
    const [formData, setFormData] = useState({
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        date_naissance: initialData.date_naissance ? new Date(initialData.date_naissance).toISOString().split('T')[0] : '', // Format date pour l'input
        sexe: initialData.sexe || '',
        groupe_sanguin: initialData.groupe_sanguin || '',
        genotype: initialData.genotype || '',
        allergies_connues: initialData.allergies_connues || '',
        maladies_chroniques: initialData.maladies_chroniques || '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updatePatientProfile(formData);
            setSuccess("Profil mis à jour !");
            onUpdateSuccess(); // Fonction pour rafraîchir les données dans le composant parent
        } catch (err) {
            setError(err.response?.data?.message || "Échec de la mise à jour du profil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h3>Modifier Mes Informations Médicales</h3>
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Champs de base (Nom, Prénom, Date de Naissance) */}
                <div className="form-row">
                    <div className="form-group"><label>Nom</label><input type="text" name="nom" value={formData.nom} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Prénom</label><input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Date de Naissance</label><input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange} required /></div>
                </div>

                {/* Champs Médicaux Select */}
                <div className="form-row">
                    <div className="form-group">
                        <label>Sexe</label>
                        <select name="sexe" value={formData.sexe} onChange={handleChange}>
                            <option value="Masculin">Masculin</option>
                            <option value="Féminin">Féminin</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Groupe Sanguin</label>
                        <select name="groupe_sanguin" value={formData.groupe_sanguin} onChange={handleChange}>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (<option key={group} value={group}>{group}</option>))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Génotype</label>
                        <select name="genotype" value={formData.genotype} onChange={handleChange}>
                            {['AA', 'AS', 'SS', 'AC'].map(geno => (<option key={geno} value={geno}>{geno}</option>))}
                        </select>
                    </div>
                </div>

                {/* Champs Médicaux Textarea */}
                <div className="form-group">
                    <label>Allergies Connues</label>
                    <textarea name="allergies_connues" value={formData.allergies_connues} onChange={handleChange} rows="2" placeholder="Séparées par des virgules..." />
                </div>
                <div className="form-group">
                    <label>Maladies Chroniques</label>
                    <textarea name="maladies_chroniques" value={formData.maladies_chroniques} onChange={handleChange} rows="2" placeholder="Séparées par des virgules..." />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Sauvegarde...' : 'Sauvegarder les Modifications'}
                </button>
            </form>
        </div>
    );
};

export default PatientProfileEdit;